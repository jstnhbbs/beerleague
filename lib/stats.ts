import type { SeasonEntry } from '@/lib/db/schema'
import { formatRecord, winPct } from '@/lib/utils'

export interface ManagerCareerStats {
    managerId: number
    seasons: number
    championships: number
    playoffAppearances: number
    playoffWins: number
    playoffLosses: number
    totalWins: number
    totalLosses: number
    totalTies: number
    regularSeasonWins: number
    regularSeasonLosses: number
    regularSeasonTies: number
    totalPointsFor: number
    totalPointsAgainst: number
    avgPointsFor: number
    avgPointsAgainst: number
    avgPointDifferential: number
    avgPowerRating: number | null
    bestPowerRating: number | null
    worstPowerRating: number | null
    bestFinish: number | null
    worstFinish: number | null
    avgFinish: number | null
    tenWinSeasons: number
    mostWinsInSeason: number
    currentTeamName: string | null
}

export interface ManagerSeasonView extends SeasonEntry {
    year: number
}

export function computeManagerCareerStats(
    managerId: number,
    entries: ManagerSeasonView[],
    currentTeamName?: string | null
): ManagerCareerStats {
    const sorted = [...entries].sort((a, b) => b.year - a.year)

    const seasons = entries.length
    const championships = entries.filter((e) => e.championshipWon).length
    const playoffAppearances = entries.filter((e) => e.playoffAppearance).length

    const totalWins = entries.reduce((sum, e) => sum + e.wins, 0)
    const totalLosses = entries.reduce((sum, e) => sum + e.losses, 0)
    const totalTies = entries.reduce((sum, e) => sum + e.ties, 0)

    const regularSeasonWins = entries.reduce(
        (sum, e) => sum + e.regularSeasonWins,
        0
    )
    const regularSeasonLosses = entries.reduce(
        (sum, e) => sum + e.regularSeasonLosses,
        0
    )
    const regularSeasonTies = entries.reduce(
        (sum, e) => sum + e.regularSeasonTies,
        0
    )

    const playoffWins = entries.reduce((sum, e) => sum + e.playoffWins, 0)
    const playoffLosses = entries.reduce((sum, e) => sum + e.playoffLosses, 0)

    const totalPointsFor = entries.reduce((sum, e) => sum + e.pointsFor, 0)
    const totalPointsAgainst = entries.reduce(
        (sum, e) => sum + e.pointsAgainst,
        0
    )

    const powerRatings = entries
        .map((e) => e.powerRating)
        .filter((value): value is number => value !== null)

    const finishes = entries.map((e) => e.finish)

    const tenWinSeasons = entries.filter(
        (e) => e.regularSeasonWins >= 10
    ).length
    const mostWinsInSeason = Math.max(
        0,
        ...entries.map((e) => e.regularSeasonWins)
    )

    return {
        managerId,
        seasons,
        championships,
        playoffAppearances,
        playoffWins,
        playoffLosses,
        totalWins,
        totalLosses,
        totalTies,
        regularSeasonWins,
        regularSeasonLosses,
        regularSeasonTies,
        totalPointsFor,
        totalPointsAgainst,
        avgPointsFor: seasons > 0 ? totalPointsFor / seasons : 0,
        avgPointsAgainst: seasons > 0 ? totalPointsAgainst / seasons : 0,
        avgPointDifferential:
            seasons > 0 ? (totalPointsFor - totalPointsAgainst) / seasons : 0,
        avgPowerRating:
            powerRatings.length > 0
                ? powerRatings.reduce((sum, value) => sum + value, 0) /
                  powerRatings.length
                : null,
        bestPowerRating:
            powerRatings.length > 0 ? Math.max(...powerRatings) : null,
        worstPowerRating:
            powerRatings.length > 0 ? Math.min(...powerRatings) : null,
        bestFinish: finishes.length > 0 ? Math.min(...finishes) : null,
        worstFinish: finishes.length > 0 ? Math.max(...finishes) : null,
        avgFinish:
            finishes.length > 0
                ? finishes.reduce((sum, value) => sum + value, 0) /
                  finishes.length
                : null,
        tenWinSeasons,
        mostWinsInSeason,
        currentTeamName:
            currentTeamName ?? sorted[0]?.teamName ?? null,
    }
}

export function rankManagers(
    rows: Array<{ managerId: number; stats: ManagerCareerStats; name: string }>
) {
    return [...rows].sort((a, b) => {
        if (b.stats.seasons !== a.stats.seasons) {
            return b.stats.seasons - a.stats.seasons
        }
        if (b.stats.championships !== a.stats.championships) {
            return b.stats.championships - a.stats.championships
        }
        const aWinPct = winPct(
            a.stats.totalWins,
            a.stats.totalLosses,
            a.stats.totalTies
        )
        const bWinPct = winPct(
            b.stats.totalWins,
            b.stats.totalLosses,
            b.stats.totalTies
        )
        if (bWinPct !== aWinPct) return bWinPct - aWinPct
        return a.name.localeCompare(b.name)
    })
}

export function formatCareerRecord(stats: ManagerCareerStats): string {
    return formatRecord(stats.totalWins, stats.totalLosses, stats.totalTies)
}

export function formatCareerWinPct(stats: ManagerCareerStats): string {
    return winPct(stats.totalWins, stats.totalLosses, stats.totalTies)
        .toFixed(3)
        .replace(/^0/, '')
}

export interface ChampionshipView {
    year: number
    teamName: string
    managerName: string
    managerSlug: string
    record: string
    pointsFor: number
    pointsAgainst: number
    margin: number
    playoffRecord: string
}

export function buildChampionshipViews(
    entries: Array<
        ManagerSeasonView & {
            managerName: string
            managerSlug: string
        }
    >
): ChampionshipView[] {
    return entries
        .filter((entry) => entry.championshipWon)
        .sort((a, b) => b.year - a.year)
        .map((entry) => ({
            year: entry.year,
            teamName: entry.teamName,
            managerName: entry.managerName,
            managerSlug: entry.managerSlug,
            record: formatRecord(
                entry.regularSeasonWins,
                entry.regularSeasonLosses,
                entry.regularSeasonTies
            ),
            pointsFor: entry.pointsFor,
            pointsAgainst: entry.pointsAgainst,
            margin: entry.pointsFor - entry.pointsAgainst,
            playoffRecord: formatRecord(entry.playoffWins, entry.playoffLosses),
        }))
}
