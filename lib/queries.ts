import { asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
    CURRENT_KEEPER_DRAFT_YEAR,
    calculateSacrificeRound,
} from '@/lib/keepers'
import { dues, keepers, managers, seasonEntries, seasons } from '@/lib/db/schema'
import {
    buildChampionshipViews,
    computeManagerCareerStats,
    rankManagers,
    type ManagerCareerStats,
    type ManagerSeasonView,
} from '@/lib/stats'

export async function getAllManagers() {
    return db.select().from(managers).orderBy(asc(managers.name))
}

export async function getManagerBySlug(slug: string) {
    const rows = await db
        .select()
        .from(managers)
        .where(eq(managers.slug, slug))
        .limit(1)
    return rows[0] ?? null
}

async function getSeasonEntriesWithYear() {
    return db
        .select({
            entry: seasonEntries,
            year: seasons.year,
            managerName: managers.name,
            managerSlug: managers.slug,
            managerCurrentTeamName: managers.currentTeamName,
        })
        .from(seasonEntries)
        .innerJoin(seasons, eq(seasonEntries.seasonId, seasons.id))
        .innerJoin(managers, eq(seasonEntries.managerId, managers.id))
        .orderBy(desc(seasons.year))
}

export async function getManagerRankings() {
    const rows = await getSeasonEntriesWithYear()
    const byManager = new Map<
        number,
        {
            name: string
            slug: string
            currentTeamName: string | null
            entries: ManagerSeasonView[]
        }
    >()

    for (const row of rows) {
        const existing = byManager.get(row.entry.managerId) ?? {
            name: row.managerName,
            slug: row.managerSlug,
            currentTeamName: row.managerCurrentTeamName,
            entries: [],
        }
        existing.entries.push({ ...row.entry, year: row.year })
        byManager.set(row.entry.managerId, existing)
    }

    const ranked = rankManagers(
        Array.from(byManager.entries()).map(([managerId, value]) => ({
            managerId,
            name: value.name,
            stats: computeManagerCareerStats(
                managerId,
                value.entries,
                value.currentTeamName
            ),
        }))
    )

    return ranked.map((row, index) => ({
        rank: index + 1,
        managerId: row.managerId,
        name: row.name,
        slug: byManager.get(row.managerId)!.slug,
        stats: row.stats,
    }))
}

export async function getManagerProfile(slug: string) {
    const manager = await getManagerBySlug(slug)
    if (!manager) return null

    const rows = await db
        .select({
            entry: seasonEntries,
            year: seasons.year,
        })
        .from(seasonEntries)
        .innerJoin(seasons, eq(seasonEntries.seasonId, seasons.id))
        .where(eq(seasonEntries.managerId, manager.id))
        .orderBy(desc(seasons.year))

    const entries: ManagerSeasonView[] = rows.map((row) => ({
        ...row.entry,
        year: row.year,
    }))

    return {
        manager,
        entries,
        stats: computeManagerCareerStats(
            manager.id,
            entries,
            manager.currentTeamName
        ),
    }
}

export async function getAllSeasonYears() {
    const rows = await db
        .select({ year: seasons.year })
        .from(seasons)
        .orderBy(desc(seasons.year))
    return rows.map((row) => row.year)
}

export async function getDuesTracker() {
    const latestSeason = await db
        .select({ id: seasons.id, year: seasons.year })
        .from(seasons)
        .orderBy(desc(seasons.year))
        .limit(1)

    if (!latestSeason[0]) {
        return {
            seasonId: null,
            seasonYear: null,
            rows: [],
        }
    }

    const rows = await db
        .select({
            managerId: managers.id,
            managerName: managers.name,
            managerSlug: managers.slug,
            currentTeamName: managers.currentTeamName,
            teamName: seasonEntries.teamName,
            finish: seasonEntries.finish,
            paid: dues.paid,
            paymentMethod: dues.paymentMethod,
            updatedAt: dues.updatedAt,
        })
        .from(seasonEntries)
        .innerJoin(managers, eq(seasonEntries.managerId, managers.id))
        .leftJoin(
            dues,
            sql`${dues.managerId} = ${managers.id} AND ${dues.seasonId} = ${latestSeason[0].id}`
        )
        .where(eq(seasonEntries.seasonId, latestSeason[0].id))
        .orderBy(asc(managers.name))

    return {
        seasonId: latestSeason[0].id,
        seasonYear: latestSeason[0].year,
        rows: rows.map((row) => ({
            ...row,
            paid: row.paid ?? false,
            paymentMethod: row.paymentMethod ?? null,
            updatedAt: row.updatedAt ?? null,
        })),
    }
}

export async function getSeasonStandings(year: number) {
    const rows = await db
        .select({
            entry: seasonEntries,
            managerName: managers.name,
            managerSlug: managers.slug,
        })
        .from(seasonEntries)
        .innerJoin(seasons, eq(seasonEntries.seasonId, seasons.id))
        .innerJoin(managers, eq(seasonEntries.managerId, managers.id))
        .where(eq(seasons.year, year))
        .orderBy(asc(seasonEntries.finish))

    return rows.map((row) => ({
        ...row.entry,
        managerName: row.managerName,
        managerSlug: row.managerSlug,
        year,
    }))
}

export async function getChampionships() {
    const rows = await getSeasonEntriesWithYear()
    const entries = rows.map((row) => ({
        ...row.entry,
        year: row.year,
        managerName: row.managerName,
        managerSlug: row.managerSlug,
    }))
    return buildChampionshipViews(entries)
}

export async function getKeepersTracker() {
    const latestSeason = await db
        .select({ id: seasons.id, year: seasons.year })
        .from(seasons)
        .orderBy(desc(seasons.year))
        .limit(1)

    if (!latestSeason[0]) {
        return {
            keeperDraftYear: CURRENT_KEEPER_DRAFT_YEAR,
            rows: [],
        }
    }

    const rows = await db
        .select({
            managerId: managers.id,
            managerName: managers.name,
            managerSlug: managers.slug,
            teamName: seasonEntries.teamName,
            playerKept: keepers.playerKept,
            seasonDrafted: keepers.seasonDrafted,
            roundKept: keepers.roundKept,
            seasonsOnRoster: keepers.seasonsOnRoster,
            firstRoundPick: keepers.firstRoundPick,
            updatedAt: keepers.updatedAt,
        })
        .from(seasonEntries)
        .innerJoin(managers, eq(seasonEntries.managerId, managers.id))
        .leftJoin(
            keepers,
            sql`${keepers.managerId} = ${managers.id} AND ${keepers.keeperDraftYear} = ${CURRENT_KEEPER_DRAFT_YEAR}`
        )
        .where(eq(seasonEntries.seasonId, latestSeason[0].id))
        .orderBy(asc(managers.name))

    return {
        keeperDraftYear: CURRENT_KEEPER_DRAFT_YEAR,
        rows: rows.map((row) => {
            const sacrificeRound = calculateSacrificeRound({
                playerKept: row.playerKept,
                roundKept: row.roundKept,
                seasonsOnRoster: row.seasonsOnRoster,
                firstRoundPick: row.firstRoundPick,
            })

            return {
                ...row,
                playerKept: row.playerKept ?? null,
                seasonDrafted: row.seasonDrafted ?? null,
                roundKept: row.roundKept ?? null,
                seasonsOnRoster: row.seasonsOnRoster ?? null,
                firstRoundPick: row.firstRoundPick ?? null,
                sacrificeRound,
                updatedAt: row.updatedAt ?? null,
            }
        }),
    }
}

export async function getLeagueSummary() {
    const [managerCount, seasonYears, championships] = await Promise.all([
        db.select().from(managers),
        getAllSeasonYears(),
        getChampionships(),
    ])

    const championshipCounts = new Map<string, number>()
    for (const championship of championships) {
        championshipCounts.set(
            championship.managerName,
            (championshipCounts.get(championship.managerName) ?? 0) + 1
        )
    }

    const topChampion = [...championshipCounts.entries()].sort(
        (a, b) => b[1] - a[1]
    )[0]

    return {
        managerCount: managerCount.length,
        firstSeason: seasonYears.at(-1) ?? null,
        latestSeason: seasonYears[0] ?? null,
        championshipCount: championships.length,
        topChampion: topChampion
            ? { name: topChampion[0], count: topChampion[1] }
            : null,
    }
}

export type ManagerRankingRow = Awaited<
    ReturnType<typeof getManagerRankings>
>[number]

export type ManagerProfile = NonNullable<
    Awaited<ReturnType<typeof getManagerProfile>>
>

export type SeasonStandingRow = Awaited<
    ReturnType<typeof getSeasonStandings>
>[number]

export type DuesTracker = Awaited<ReturnType<typeof getDuesTracker>>
export type DuesTrackerRow = DuesTracker['rows'][number]

export type KeepersTracker = Awaited<ReturnType<typeof getKeepersTracker>>
export type KeepersTrackerRow = KeepersTracker['rows'][number]

export type { ManagerCareerStats, ManagerSeasonView }
