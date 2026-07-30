import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { parseJsonBody } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { managers, seasonEntries, seasons } from '@/lib/db/schema'
import { parseSeasonEntryInput } from '@/lib/season-entry'

export async function POST(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = await parseJsonBody(request)
    if ('error' in parsed) return parsed.error

    const entryInput = parseSeasonEntryInput(parsed.data)
    if (typeof entryInput === 'string') {
        return NextResponse.json({ error: entryInput }, { status: 400 })
    }

    const manager = await db
        .select()
        .from(managers)
        .where(eq(managers.id, entryInput.managerId))
        .limit(1)

    if (!manager[0]) {
        return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }

    let season = await db
        .select()
        .from(seasons)
        .where(eq(seasons.year, entryInput.year))
        .limit(1)

    if (!season[0]) {
        const insertedSeason = await db
            .insert(seasons)
            .values({ year: entryInput.year })
            .returning()
        season = insertedSeason
    }

    const existing = await db
        .select()
        .from(seasonEntries)
        .where(
            and(
                eq(seasonEntries.seasonId, season[0].id),
                eq(seasonEntries.managerId, entryInput.managerId)
            )
        )
        .limit(1)

    if (existing[0]) {
        return NextResponse.json(
            { error: 'This manager already has an entry for that season' },
            { status: 409 }
        )
    }

    const wins = entryInput.regularSeasonWins + entryInput.playoffWins
    const losses = entryInput.regularSeasonLosses + entryInput.playoffLosses

    try {
        const inserted = await db
            .insert(seasonEntries)
            .values({
                seasonId: season[0].id,
                managerId: entryInput.managerId,
                teamName: entryInput.teamName,
                finish: entryInput.finish,
                powerRating: entryInput.powerRating,
                gamesPlayed: wins + losses + entryInput.regularSeasonTies,
                wins,
                losses,
                ties: entryInput.regularSeasonTies,
                moves: entryInput.moves,
                pointsFor: entryInput.pointsFor,
                pointsAgainst: entryInput.pointsAgainst,
                pointsForGameHigh: entryInput.pointsForGameHigh,
                pointsForGameLow: entryInput.pointsForGameLow,
                regularSeasonWins: entryInput.regularSeasonWins,
                regularSeasonLosses: entryInput.regularSeasonLosses,
                regularSeasonTies: entryInput.regularSeasonTies,
                playoffAppearance: entryInput.playoffAppearance,
                playoffBye: entryInput.playoffBye,
                playoffWins: entryInput.playoffWins,
                playoffLosses: entryInput.playoffLosses,
                championshipWon: entryInput.championshipWon,
            })
            .returning()

        const latestSeason = await db
            .select({ year: seasons.year })
            .from(seasons)
            .orderBy(desc(seasons.year))
            .limit(1)

        if (latestSeason[0]?.year === entryInput.year) {
            await db
                .update(managers)
                .set({ currentTeamName: entryInput.teamName })
                .where(eq(managers.id, entryInput.managerId))
        }

        return NextResponse.json(inserted[0])
    } catch (error) {
        const message =
            error instanceof Error ? error.message.toLowerCase() : ''

        if (message.includes('unique') || message.includes('constraint')) {
            return NextResponse.json(
                { error: 'This manager already has an entry for that season' },
                { status: 409 }
            )
        }

        console.error('Failed to create season entry:', error)
        return NextResponse.json(
            { error: 'Failed to save season entry' },
            { status: 400 }
        )
    }
}
