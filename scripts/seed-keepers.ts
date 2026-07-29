import './load-env'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { keepers, managers } from '../lib/db/schema'
import { CURRENT_KEEPER_DRAFT_YEAR } from '../lib/keepers'

interface SeedKeeperRow {
    slug: string
    playerKept: string | null
    seasonDrafted: number | null
    roundKept: number | null
    seasonsOnRoster: number | null
    firstRoundPick: string | null
}

const SEED_ROWS: SeedKeeperRow[] = [
    {
        slug: 'price-bahcall',
        playerKept: null,
        seasonDrafted: null,
        roundKept: null,
        seasonsOnRoster: null,
        firstRoundPick: "Ja'Marr Chase",
    },
    {
        slug: 'paul-bullington',
        playerKept: 'Breece Hall',
        seasonDrafted: 2023,
        roundKept: 6,
        seasonsOnRoster: 2,
        firstRoundPick: 'Garrett Wilson',
    },
    {
        slug: 'garrett-burkett',
        playerKept: 'Saquon Barkley',
        seasonDrafted: 2023,
        roundKept: 1,
        seasonsOnRoster: null,
        firstRoundPick: 'Saquon Barkley',
    },
    {
        slug: 'justin-dougher',
        playerKept: 'Amon-Ra St. Brown',
        seasonDrafted: 2023,
        roundKept: 3,
        seasonsOnRoster: 2,
        firstRoundPick: 'Jonathon Taylor',
    },
    {
        slug: 'blade-healey',
        playerKept: 'Bijan Robinson',
        seasonDrafted: 2023,
        roundKept: 1,
        seasonsOnRoster: null,
        firstRoundPick: 'Bijan Robinson',
    },
    {
        slug: 'justin-hobbs',
        playerKept: 'Isiah Pacheco',
        seasonDrafted: 2023,
        roundKept: 7,
        seasonsOnRoster: 2,
        firstRoundPick: 'Justin Jefferson',
    },
    {
        slug: 'michael-morales',
        playerKept: "De'Von Achane",
        seasonDrafted: 2023,
        roundKept: 10,
        seasonsOnRoster: 2,
        firstRoundPick: 'CeeDee Lamb',
    },
    {
        slug: 'matt-organ',
        playerKept: 'Tyreek Hill',
        seasonDrafted: 2023,
        roundKept: 1,
        seasonsOnRoster: null,
        firstRoundPick: 'Tyreek Hill',
    },
    {
        slug: 'dillon-reed',
        playerKept: null,
        seasonDrafted: null,
        roundKept: null,
        seasonsOnRoster: null,
        firstRoundPick: null,
    },
    {
        slug: 'andrew-womble',
        playerKept: 'Kyren Williams',
        seasonDrafted: 2023,
        roundKept: 10,
        seasonsOnRoster: 2,
        firstRoundPick: 'A.J. Brown',
    },
]

async function seedKeepers() {
    const updatedAt = new Date().toISOString()

    for (const row of SEED_ROWS) {
        const manager = await db
            .select({ id: managers.id })
            .from(managers)
            .where(eq(managers.slug, row.slug))
            .limit(1)

        if (!manager[0]) {
            console.warn(`Skipping unknown manager slug: ${row.slug}`)
            continue
        }

        await db
            .insert(keepers)
            .values({
                keeperDraftYear: CURRENT_KEEPER_DRAFT_YEAR,
                managerId: manager[0].id,
                playerKept: row.playerKept,
                seasonDrafted: row.seasonDrafted,
                roundKept: row.roundKept,
                seasonsOnRoster: row.seasonsOnRoster,
                firstRoundPick: row.firstRoundPick,
                updatedAt,
            })
            .onConflictDoUpdate({
                target: [keepers.keeperDraftYear, keepers.managerId],
                set: {
                    playerKept: row.playerKept,
                    seasonDrafted: row.seasonDrafted,
                    roundKept: row.roundKept,
                    seasonsOnRoster: row.seasonsOnRoster,
                    firstRoundPick: row.firstRoundPick,
                    updatedAt,
                },
            })

        console.log(`Seeded keeper row for ${row.slug}`)
    }

    console.log('Keeper seed complete.')
}

seedKeepers().catch((error) => {
    console.error(error)
    process.exit(1)
})
