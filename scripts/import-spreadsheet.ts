import * as XLSX from 'xlsx'
import { db } from '../lib/db'
import { managers, seasonEntries, seasons } from '../lib/db/schema'
import { normalizeSeasonFlags } from '../lib/season-entry'
import { isValidSlug, parseBool, parseNumber, slugify } from '../lib/utils'

const REQUIRED_SHEETS = [
    'Year by Year Standings',
    'Championship Seasons',
    'Overall Manager Rankings',
] as const

const SYSTEM_SHEETS = new Set([
    'Overall Manager Rankings',
    'Rankings Legend',
    'Year by Year Standings',
    'Championship Seasons',
    'Head-2-Head Records',
    'Playoff Odds',
    'Individual Seasons',
    'League Records',
    'Copy of POINTS',
    'BLANK',
    'New Manager 1',
    'New Manager 2',
])

const SKIP_ROW_LABELS = new Set([
    'total',
    'avg.',
    'average:',
    'best',
    'worst',
    'h2h',
    'best/most:',
    'worst/least:',
])

interface ParsedSeasonRow {
    year: number
    finish: number
    powerRating: number | null
    gamesPlayed: number
    wins: number
    losses: number
    ties: number
    moves: number
    pointsFor: number
    pointsAgainst: number
    pointsForGameHigh: number | null
    pointsForGameLow: number | null
    regularSeasonWins: number
    regularSeasonLosses: number
    regularSeasonTies: number
    playoffAppearance: boolean
    playoffBye: boolean
    playoffWins: number
    playoffLosses: number
    championshipWon: boolean
}

interface YearStandingRow {
    year: number
    finish: number
    teamName: string
}

function validateWorkbook(workbook: XLSX.WorkBook): void {
    const missing = REQUIRED_SHEETS.filter((name) => !workbook.Sheets[name])
    if (missing.length > 0) {
        throw new Error(
            `Spreadsheet is missing required sheets: ${missing.join(', ')}`
        )
    }
}

function resolveSpreadsheetPath(): string {
    const spreadsheetPath = process.argv[2] ?? process.env.SPREADSHEET_PATH
    if (!spreadsheetPath) {
        throw new Error(
            'Spreadsheet path required. Set SPREADSHEET_PATH or pass a file path argument.'
        )
    }
    return spreadsheetPath
}

function cellValue(row: unknown[], index: number): unknown {
    return row[index]
}

function cellString(row: unknown[], index: number): string {
    const value = cellValue(row, index)
    if (value === null || value === undefined) return ''
    return String(value).trim()
}

function parseYear(value: unknown): number | null {
    const num = parseNumber(value)
    if (num === null) return null
    const year = Math.round(num)
    if (year < 2000 || year > 2100) return null
    return year
}

function parseFinish(value: unknown): number | null {
    const text = String(value ?? '').trim()
    const match = text.match(/\d+/)
    if (!match) return null
    return Number(match[0])
}

function parseManagerSheet(
    sheet: XLSX.WorkSheet,
    managerName: string
): ParsedSeasonRow[] {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
        raw: true,
    })

    const parsed: ParsedSeasonRow[] = []

    for (const row of rows) {
        if (!Array.isArray(row)) continue

        const yearLabel = cellString(row, 0).toLowerCase()
        if (SKIP_ROW_LABELS.has(yearLabel)) break
        if (!yearLabel) continue

        const year = parseYear(row[0])
        if (!year) continue

        const finish = parseFinish(row[2])
        const wins = parseNumber(row[4])
        const losses = parseNumber(row[5])
        const pointsFor = parseNumber(row[9])
        const pointsAgainst = parseNumber(row[13])
        const regularSeasonWins = parseNumber(row[18])
        const regularSeasonLosses = parseNumber(row[19])

        if (
            finish === null ||
            wins === null ||
            losses === null ||
            pointsFor === null ||
            pointsAgainst === null ||
            regularSeasonWins === null ||
            regularSeasonLosses === null
        ) {
            console.warn(
                `Skipping incomplete row for ${managerName} ${year}`
            )
            continue
        }

        parsed.push({
            year,
            finish,
            powerRating: parseNumber(row[1]),
            gamesPlayed: parseNumber(row[3]) ?? wins + losses + (parseNumber(row[6]) ?? 0),
            wins,
            losses,
            ties: parseNumber(row[6]) ?? 0,
            moves: parseNumber(row[8]) ?? 0,
            pointsFor,
            pointsAgainst,
            pointsForGameHigh: parseNumber(row[11]),
            pointsForGameLow: parseNumber(row[12]),
            regularSeasonWins,
            regularSeasonLosses,
            regularSeasonTies: parseNumber(row[20]) ?? 0,
            playoffAppearance: parseBool(row[22]),
            playoffBye: parseBool(row[23]),
            playoffWins: parseNumber(row[25]) ?? 0,
            playoffLosses: parseNumber(row[26]) ?? 0,
            championshipWon: parseBool(row[28]),
        })
    }

    return parsed
}

interface YearStandingsIndex {
    teamByYearFinish: Map<string, string>
    teamByYearPowerRating: Map<string, string>
}

function powerRatingKey(value: number): string {
    return value.toFixed(7)
}

function parseYearByYearStandings(
    sheet: XLSX.WorkSheet
): YearStandingsIndex {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
        raw: true,
    })

    const teamByYearFinish = new Map<string, string>()
    const teamByYearPowerRating = new Map<string, string>()
    let currentYear: number | null = null

    for (const row of rows) {
        if (!Array.isArray(row)) continue

        const maybeYear = parseYear(row[0])
        if (maybeYear && cellString(row, 2) === 'Record') {
            currentYear = maybeYear
            continue
        }

        if (!currentYear) continue

        const rankText = cellString(row, 0)
        if (!rankText || rankText.toLowerCase() === 'rank') continue
        if (rankText.toLowerCase() === 'average' || cellString(row, 1) === 'Average') {
            currentYear = null
            continue
        }

        const finish = parseFinish(rankText)
        const teamName = cellString(row, 1)
        const powerRating = parseNumber(row[2])

        if (finish === null) continue

        if (teamName) {
            teamByYearFinish.set(`${currentYear}:${finish}`, teamName)
            if (powerRating !== null) {
                teamByYearPowerRating.set(
                    `${currentYear}:${powerRatingKey(powerRating)}`,
                    teamName
                )
            }
        }
    }

    return { teamByYearFinish, teamByYearPowerRating }
}

function parseChampionships(
    sheet: XLSX.WorkSheet
): Map<string, { teamName: string; managerName: string }> {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
        raw: true,
    })

    const champions = new Map<string, { teamName: string; managerName: string }>()

    for (const row of rows) {
        if (!Array.isArray(row)) continue
        const year = parseYear(row[0])
        const teamName = cellString(row, 3)
        const managerName = cellString(row, 4)
        if (!year || !teamName || !managerName) continue
        champions.set(`${year}:${managerName.toLowerCase()}`, {
            teamName,
            managerName,
        })
    }

    return champions
}

function parseOverallManagerRankings(
    sheet: XLSX.WorkSheet
): Map<string, string> {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
        raw: true,
    })

    const currentTeamByManager = new Map<string, string>()

    for (const row of rows) {
        if (!Array.isArray(row)) continue

        const managerName = cellString(row, 1)
        const teamName = cellString(row, 2)
        if (!managerName || !teamName) continue
        if (managerName.toLowerCase().startsWith('template')) continue

        currentTeamByManager.set(managerName.toLowerCase(), teamName)
    }

    return currentTeamByManager
}

function resolveTeamName(
    year: number,
    finish: number,
    powerRating: number | null,
    managerName: string,
    standings: YearStandingsIndex,
    champions: Map<string, { teamName: string; managerName: string }>
): string {
    const champion = champions.get(`${year}:${managerName.toLowerCase()}`)
    if (champion) return champion.teamName

    const fromStandings = standings.teamByYearFinish.get(`${year}:${finish}`)
    if (fromStandings) return fromStandings

    if (powerRating !== null) {
        const fromPowerRating = standings.teamByYearPowerRating.get(
            `${year}:${powerRatingKey(powerRating)}`
        )
        if (fromPowerRating) return fromPowerRating
    }

    return `${managerName} (${year})`
}

async function main() {
    const spreadsheetPath = resolveSpreadsheetPath()
    const workbook = XLSX.readFile(spreadsheetPath)
    validateWorkbook(workbook)

    const standings = parseYearByYearStandings(
        workbook.Sheets['Year by Year Standings']
    )
    const champions = parseChampionships(workbook.Sheets['Championship Seasons'])
    const currentTeamByManager = parseOverallManagerRankings(
        workbook.Sheets['Overall Manager Rankings']
    )

    const managerSheetNames = workbook.SheetNames.filter(
        (name) => !SYSTEM_SHEETS.has(name)
    )

    console.log(`Importing ${managerSheetNames.length} manager sheets...`)

    const managerRows = managerSheetNames.flatMap((sheetName) => {
        const slug = slugify(sheetName)
        if (!isValidSlug(slug)) {
            console.warn(`Skipping manager sheet with invalid slug: ${sheetName}`)
            return []
        }

        const parsedRows = parseManagerSheet(
            workbook.Sheets[sheetName],
            sheetName
        )

        return [
            {
                sheetName,
                slug,
                currentTeamName:
                    currentTeamByManager.get(sheetName.toLowerCase()) ?? null,
                parsedRows,
            },
        ]
    })

    let entryCount = 0

    await db.transaction(async (tx) => {
        await tx.delete(seasonEntries)
        await tx.delete(seasons)
        await tx.delete(managers)

        const seasonIdByYear = new Map<number, number>()
        const managerIdBySlug = new Map<string, number>()

        for (const manager of managerRows) {
            const inserted = await tx
                .insert(managers)
                .values({
                    name: manager.sheetName,
                    slug: manager.slug,
                    currentTeamName: manager.currentTeamName,
                    createdAt: new Date().toISOString(),
                })
                .returning({ id: managers.id })

            managerIdBySlug.set(manager.slug, inserted[0].id)
        }

        for (const manager of managerRows) {
            const managerId = managerIdBySlug.get(manager.slug)
            if (!managerId) continue

            for (const row of manager.parsedRows) {
                let seasonId = seasonIdByYear.get(row.year)
                if (!seasonId) {
                    const insertedSeason = await tx
                        .insert(seasons)
                        .values({ year: row.year })
                        .returning({ id: seasons.id })
                    seasonId = insertedSeason[0].id
                    seasonIdByYear.set(row.year, seasonId)
                }

                const champion = champions.get(
                    `${row.year}:${manager.sheetName.toLowerCase()}`
                )
                const championshipWon = champion ? true : row.championshipWon
                const { playoffAppearance } = normalizeSeasonFlags({
                    playoffAppearance: row.playoffAppearance,
                    championshipWon,
                })

                const teamName = resolveTeamName(
                    row.year,
                    row.finish,
                    row.powerRating,
                    manager.sheetName,
                    standings,
                    champions
                )

                await tx.insert(seasonEntries).values({
                    seasonId,
                    managerId,
                    teamName,
                    finish: row.finish,
                    powerRating: row.powerRating,
                    gamesPlayed: row.gamesPlayed,
                    wins: row.wins,
                    losses: row.losses,
                    ties: row.ties,
                    moves: row.moves,
                    pointsFor: row.pointsFor,
                    pointsAgainst: row.pointsAgainst,
                    pointsForGameHigh: row.pointsForGameHigh,
                    pointsForGameLow: row.pointsForGameLow,
                    regularSeasonWins: row.regularSeasonWins,
                    regularSeasonLosses: row.regularSeasonLosses,
                    regularSeasonTies: row.regularSeasonTies,
                    playoffAppearance,
                    playoffBye: row.playoffBye,
                    playoffWins: row.playoffWins,
                    playoffLosses: row.playoffLosses,
                    championshipWon,
                })

                entryCount += 1
            }
        }

        console.log(
            `Import complete: ${managerRows.length} managers, ${seasonIdByYear.size} seasons, ${entryCount} entries.`
        )
    })
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
