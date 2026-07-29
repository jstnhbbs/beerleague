import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { parseJsonBody } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { keepers } from '@/lib/db/schema'
import {
    CURRENT_KEEPER_DRAFT_YEAR,
    MAX_SEASONS_ON_ROSTER,
    normalizePlayerName,
    normalizeRoundKept,
    normalizeSeasonDrafted,
    normalizeSeasonsOnRoster,
    resolveRoundKept,
} from '@/lib/keepers'
import { getKeepersTracker } from '@/lib/queries'

interface KeeperUpdate {
    managerId?: unknown
    playerKept?: unknown
    seasonDrafted?: unknown
    roundKept?: unknown
    seasonsOnRoster?: unknown
    firstRoundPick?: unknown
}

interface KeeperUpdateRequest {
    keepers?: KeeperUpdate[]
}

interface ValidatedKeeperUpdate {
    keeperDraftYear: number
    managerId: number
    playerKept: string | null
    seasonDrafted: number | null
    roundKept: number | null
    seasonsOnRoster: number | null
    firstRoundPick: string | null
    updatedAt: string
}

export async function PUT(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = await parseJsonBody<KeeperUpdateRequest>(request)
    if ('error' in parsed) return parsed.error

    if (!Array.isArray(parsed.data.keepers)) {
        return NextResponse.json(
            { error: 'Keeper updates are required' },
            { status: 400 }
        )
    }

    const tracker = await getKeepersTracker()
    const activeManagerIds = new Set(
        tracker.rows.map((row) => row.managerId)
    )

    const updates: ValidatedKeeperUpdate[] = []
    const updatedAt = new Date().toISOString()

    for (const row of parsed.data.keepers) {
        const managerId = Number(row.managerId)

        if (!Number.isInteger(managerId) || !activeManagerIds.has(managerId)) {
            return NextResponse.json(
                { error: 'Invalid active manager' },
                { status: 400 }
            )
        }

        const playerKept = normalizePlayerName(row.playerKept) || null
        const firstRoundPick = normalizePlayerName(row.firstRoundPick) || null

        if (!playerKept) {
            updates.push({
                keeperDraftYear: CURRENT_KEEPER_DRAFT_YEAR,
                managerId,
                playerKept: null,
                seasonDrafted: null,
                roundKept: null,
                seasonsOnRoster: null,
                firstRoundPick,
                updatedAt,
            })
            continue
        }

        const seasonDrafted = normalizeSeasonDrafted(row.seasonDrafted)
        const roundKept = resolveRoundKept(
            playerKept,
            seasonDrafted,
            normalizeRoundKept(row.roundKept)
        )
        const seasonsOnRoster = normalizeSeasonsOnRoster(row.seasonsOnRoster)

        if (seasonDrafted !== null && roundKept === null) {
            return NextResponse.json(
                { error: 'Round kept is required for drafted players' },
                { status: 400 }
            )
        }

        if (seasonsOnRoster === null) {
            return NextResponse.json(
                {
                    error: 'Seasons on roster is required when a keeper is declared',
                },
                { status: 400 }
            )
        }

        if (seasonsOnRoster > MAX_SEASONS_ON_ROSTER) {
            return NextResponse.json(
                {
                    error: `Players can only be on roster for ${MAX_SEASONS_ON_ROSTER} seasons total`,
                },
                { status: 400 }
            )
        }

        updates.push({
            keeperDraftYear: CURRENT_KEEPER_DRAFT_YEAR,
            managerId,
            playerKept,
            seasonDrafted,
            roundKept,
            seasonsOnRoster,
            firstRoundPick,
            updatedAt,
        })
    }

    if (updates.length === 0) {
        return NextResponse.json({ ok: true })
    }

    try {
        await db
            .insert(keepers)
            .values(updates)
            .onConflictDoUpdate({
                target: [keepers.keeperDraftYear, keepers.managerId],
                set: {
                    playerKept: sql`excluded.player_kept`,
                    seasonDrafted: sql`excluded.season_drafted`,
                    roundKept: sql`excluded.round_kept`,
                    seasonsOnRoster: sql`excluded.seasons_on_roster`,
                    firstRoundPick: sql`excluded.first_round_pick`,
                    updatedAt: sql`excluded.updated_at`,
                },
            })
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to update keepers'
        return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
