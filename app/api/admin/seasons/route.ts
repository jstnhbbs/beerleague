import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { managers, seasonEntries, seasons } from '@/lib/db/schema'

export async function POST(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const year = Number(body.year)
    const managerId = Number(body.managerId)

    if (!Number.isFinite(year) || !Number.isFinite(managerId)) {
        return NextResponse.json({ error: 'Invalid year or manager' }, { status: 400 })
    }

    const manager = await db
        .select()
        .from(managers)
        .where(eq(managers.id, managerId))
        .limit(1)

    if (!manager[0]) {
        return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }

    let season = await db
        .select()
        .from(seasons)
        .where(eq(seasons.year, year))
        .limit(1)

    if (!season[0]) {
        const insertedSeason = await db
            .insert(seasons)
            .values({ year })
            .returning()
        season = insertedSeason
    }

    const existing = await db
        .select()
        .from(seasonEntries)
        .where(
            and(
                eq(seasonEntries.seasonId, season[0].id),
                eq(seasonEntries.managerId, managerId)
            )
        )
        .limit(1)

    if (existing[0]) {
        return NextResponse.json(
            { error: 'This manager already has an entry for that season' },
            { status: 409 }
        )
    }

    const regularSeasonWins = Number(body.regularSeasonWins ?? 0)
    const regularSeasonLosses = Number(body.regularSeasonLosses ?? 0)
    const regularSeasonTies = Number(body.regularSeasonTies ?? 0)
    const playoffWins = Number(body.playoffWins ?? 0)
    const playoffLosses = Number(body.playoffLosses ?? 0)
    const wins = regularSeasonWins + playoffWins
    const losses = regularSeasonLosses + playoffLosses

    const inserted = await db
        .insert(seasonEntries)
        .values({
            seasonId: season[0].id,
            managerId,
            teamName: String(body.teamName ?? '').trim() || manager[0].name,
            finish: Number(body.finish ?? 1),
            powerRating: body.powerRating ? Number(body.powerRating) : null,
            gamesPlayed: wins + losses + regularSeasonTies,
            wins,
            losses,
            ties: regularSeasonTies,
            moves: Number(body.moves ?? 0),
            pointsFor: Number(body.pointsFor ?? 0),
            pointsAgainst: Number(body.pointsAgainst ?? 0),
            pointsForGameHigh: body.pointsForGameHigh
                ? Number(body.pointsForGameHigh)
                : null,
            pointsForGameLow: body.pointsForGameLow
                ? Number(body.pointsForGameLow)
                : null,
            regularSeasonWins,
            regularSeasonLosses,
            regularSeasonTies,
            playoffAppearance: Boolean(body.playoffAppearance),
            playoffBye: Boolean(body.playoffBye),
            playoffWins,
            playoffLosses,
            championshipWon: Boolean(body.championshipWon),
        })
        .returning()

    return NextResponse.json(inserted[0])
}
