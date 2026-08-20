import {
    headToHeadManagers as sourceManagers,
    headToHeadMatrix as sourceMatrix,
    headToHeadSeasonCounts,
    headToHeadSourceGameCount,
} from '@/lib/head-to-head-data'
import { formatRecord, winPct } from '@/lib/utils'

export interface HeadToHeadMatrixRow {
    manager: string
    records: string[]
}

export interface ParsedHeadToHeadRecord {
    wins: number
    losses: number
    ties: number
    games: number
    winPct: number
}

export interface HeadToHeadMatchupRow extends ParsedHeadToHeadRecord {
    opponent: string
    record: string
}

export interface HeadToHeadSummary extends ParsedHeadToHeadRecord {
    manager: string
    bestMatchup: HeadToHeadMatchupRow | null
    toughestMatchup: HeadToHeadMatchupRow | null
}

export const headToHeadManagers = sourceManagers
export const headToHeadMatrix = sourceMatrix
export { headToHeadSeasonCounts, headToHeadSourceGameCount }

export function parseHeadToHeadRecord(record: string): ParsedHeadToHeadRecord {
    if (record === '-') {
        return { wins: 0, losses: 0, ties: 0, games: 0, winPct: 0 }
    }

    const [wins = 0, losses = 0, ties = 0] = record
        .split('-')
        .map((value) => Number(value))

    return {
        wins,
        losses,
        ties,
        games: wins + losses + ties,
        winPct: winPct(wins, losses, ties),
    }
}

export function formatHeadToHeadRecord(
    record: ParsedHeadToHeadRecord
): string {
    return formatRecord(record.wins, record.losses, record.ties)
}

export function invertHeadToHeadRecord(record: string): string {
    const parsed = parseHeadToHeadRecord(record)
    return formatRecord(parsed.losses, parsed.wins, parsed.ties)
}

export function getSortedHeadToHeadManagers(): string[] {
    return [...headToHeadManagers].sort((a, b) => a.localeCompare(b))
}

export function getSortedHeadToHeadMatrix(): HeadToHeadMatrixRow[] {
    const sortedManagers = getSortedHeadToHeadManagers()
    const matrixByManager = new Map<string, HeadToHeadMatrixRow>(
        headToHeadMatrix.map((row) => [row.manager, row])
    )
    const originalManagerIndex = new Map<string, number>(
        headToHeadManagers.map((manager, index) => [manager, index])
    )

    return sortedManagers.map((manager) => {
        const sourceRow = matrixByManager.get(manager)
        return {
            manager,
            records: sortedManagers.map((opponent) => {
                const recordIndex = originalManagerIndex.get(opponent)
                if (!sourceRow || recordIndex === undefined) return '0-0'
                return sourceRow.records[recordIndex] ?? '0-0'
            }),
        }
    })
}

export function getHeadToHeadRecord(
    manager: string,
    opponent: string
): string | null {
    const row = headToHeadMatrix.find((entry) => entry.manager === manager)
    const opponentIndex = (headToHeadManagers as readonly string[]).findIndex(
        (entry) => entry === opponent
    )
    if (!row || opponentIndex === -1) return null
    return row.records[opponentIndex] ?? null
}

function matchupSortValue(matchup: HeadToHeadMatchupRow): number {
    if (matchup.games === 0) return -1
    return matchup.winPct * 1000 + matchup.wins - matchup.losses
}

export function getManagerHeadToHeadRows(
    manager: string
): HeadToHeadMatchupRow[] {
    const sortedManagers = getSortedHeadToHeadManagers()
    const matrix = getSortedHeadToHeadMatrix()
    const selectedRow = matrix.find((row) => row.manager === manager)
    if (!selectedRow) return []

    return sortedManagers
        .map((opponent, index) => {
            const record = selectedRow.records[index] ?? '0-0'
            return {
                opponent,
                record,
                ...parseHeadToHeadRecord(record),
            }
        })
        .filter((matchup) => matchup.opponent !== manager)
}

export function getManagerHeadToHeadSummary(
    manager: string
): HeadToHeadSummary | null {
    const matchups = getManagerHeadToHeadRows(manager)
    if (matchups.length === 0) return null

    const totals = matchups.reduce(
        (sum, matchup) => ({
            wins: sum.wins + matchup.wins,
            losses: sum.losses + matchup.losses,
            ties: sum.ties + matchup.ties,
        }),
        { wins: 0, losses: 0, ties: 0 }
    )
    const playedMatchups = matchups.filter((matchup) => matchup.games > 0)
    const bestMatchup =
        [...playedMatchups].sort(
            (a, b) => matchupSortValue(b) - matchupSortValue(a)
        )[0] ?? null
    const toughestMatchup =
        [...playedMatchups].sort(
            (a, b) => matchupSortValue(a) - matchupSortValue(b)
        )[0] ?? null

    return {
        manager,
        ...totals,
        games: totals.wins + totals.losses + totals.ties,
        winPct: winPct(totals.wins, totals.losses, totals.ties),
        bestMatchup,
        toughestMatchup,
    }
}

export function validateHeadToHeadData(): string[] {
    const errors: string[] = []
    const managerSet = new Set<string>(headToHeadManagers)

    if (managerSet.size !== headToHeadManagers.length) {
        errors.push('Head-to-head manager list contains duplicate names.')
    }

    if (headToHeadMatrix.length !== headToHeadManagers.length) {
        errors.push('Head-to-head matrix row count does not match managers.')
    }

    const sourceGameTotal = Object.values(headToHeadSeasonCounts).reduce(
        (sum, count) => sum + count,
        0
    )
    if (sourceGameTotal !== headToHeadSourceGameCount) {
        errors.push(
            `Head-to-head season count total ${sourceGameTotal} does not match source count ${headToHeadSourceGameCount}.`
        )
    }

    headToHeadMatrix.forEach((row, rowIndex) => {
        if (!managerSet.has(row.manager)) {
            errors.push(`Unknown head-to-head matrix manager: ${row.manager}.`)
        }
        if (row.records.length !== headToHeadManagers.length) {
            errors.push(`${row.manager} has ${row.records.length} records.`)
        }
        if (row.records[rowIndex] !== '-') {
            errors.push(`${row.manager} self matchup should be "-".`)
        }

        row.records.forEach((record, colIndex) => {
            if (rowIndex === colIndex) return
            if (!/^\d+-\d+(-\d+)?$/.test(record)) {
                errors.push(`${row.manager} has invalid record ${record}.`)
                return
            }

            const inverse = headToHeadMatrix[colIndex]?.records[rowIndex]
            if (inverse && invertHeadToHeadRecord(record) !== inverse) {
                errors.push(
                    `${row.manager} vs ${headToHeadManagers[colIndex]} is not mirrored.`
                )
            }
        })
    })

    return errors
}
