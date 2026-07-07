import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { managers, seasonEntries, seasons } from '@/lib/db/schema'
import {
    buildChampionshipViews,
    computeManagerCareerStats,
    rankManagersByPowerRating,
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
            entries: ManagerSeasonView[]
        }
    >()

    for (const row of rows) {
        const existing = byManager.get(row.entry.managerId) ?? {
            name: row.managerName,
            slug: row.managerSlug,
            entries: [],
        }
        existing.entries.push({ ...row.entry, year: row.year })
        byManager.set(row.entry.managerId, existing)
    }

    const ranked = rankManagersByPowerRating(
        Array.from(byManager.entries()).map(([managerId, value]) => ({
            managerId,
            name: value.name,
            stats: computeManagerCareerStats(managerId, value.entries),
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
        stats: computeManagerCareerStats(manager.id, entries),
    }
}

export async function getAllSeasonYears() {
    const rows = await db
        .select({ year: seasons.year })
        .from(seasons)
        .orderBy(desc(seasons.year))
    return rows.map((row) => row.year)
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

export type { ManagerCareerStats, ManagerSeasonView }
