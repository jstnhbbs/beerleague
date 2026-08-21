import './load-env'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL ?? 'file:local.db'
const authToken = process.env.TURSO_AUTH_TOKEN
const client = createClient(authToken ? { url, authToken } : { url })

interface SeasonRow {
    id: number
    year: number
}

function shortSeasonId(year: number): number {
    return year - 2000
}

async function main() {
    const seasonsResult = await client.execute(
        'SELECT id, year FROM seasons ORDER BY year'
    )
    const seasons = seasonsResult.rows.map((row) => ({
        id: Number(row.id),
        year: Number(row.year),
    })) satisfies SeasonRow[]

    const mappings = seasons.map((season) => ({
        oldId: season.id,
        newId: shortSeasonId(season.year),
        year: season.year,
    }))

    if (mappings.every((mapping) => mapping.oldId === mapping.newId)) {
        console.log('Season IDs already match short year IDs.')
        return
    }

    const desiredIds = new Set(mappings.map((mapping) => mapping.newId))
    if (desiredIds.size !== mappings.length) {
        throw new Error('Cannot migrate season IDs; duplicate target IDs found.')
    }

    const maxSeasonId = Math.max(...mappings.map((mapping) => mapping.newId))

    await client.batch([
        'ALTER TABLE season_entries RENAME TO season_entries_old',
        'ALTER TABLE dues RENAME TO dues_old',
        'ALTER TABLE seasons RENAME TO seasons_old',
        `
            CREATE TABLE seasons (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                year INTEGER NOT NULL
            )
        `,
        `
            CREATE TABLE season_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                season_id INTEGER NOT NULL,
                manager_id INTEGER NOT NULL,
                team_name TEXT NOT NULL,
                finish INTEGER NOT NULL,
                power_rating REAL,
                games_played INTEGER NOT NULL,
                wins INTEGER NOT NULL,
                losses INTEGER NOT NULL,
                ties INTEGER DEFAULT 0 NOT NULL,
                moves INTEGER DEFAULT 0,
                points_for REAL NOT NULL,
                points_against REAL NOT NULL,
                points_for_game_high REAL,
                points_for_game_low REAL,
                regular_season_wins INTEGER NOT NULL,
                regular_season_losses INTEGER NOT NULL,
                regular_season_ties INTEGER DEFAULT 0 NOT NULL,
                playoff_appearance INTEGER DEFAULT false NOT NULL,
                playoff_bye INTEGER DEFAULT false NOT NULL,
                playoff_wins INTEGER DEFAULT 0 NOT NULL,
                playoff_losses INTEGER DEFAULT 0 NOT NULL,
                championship_won INTEGER DEFAULT false NOT NULL,
                FOREIGN KEY (season_id) REFERENCES seasons(id) ON UPDATE no action ON DELETE no action,
                FOREIGN KEY (manager_id) REFERENCES managers(id) ON UPDATE no action ON DELETE no action
            )
        `,
        `
            CREATE TABLE dues (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                season_id INTEGER NOT NULL,
                manager_id INTEGER NOT NULL,
                paid INTEGER DEFAULT false NOT NULL,
                payment_method TEXT,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (season_id) REFERENCES seasons(id),
                FOREIGN KEY (manager_id) REFERENCES managers(id)
            )
        `,
        `
            INSERT INTO seasons (id, year)
            SELECT year - 2000, year
            FROM seasons_old
            ORDER BY year
        `,
        `
            INSERT INTO season_entries (
                id,
                season_id,
                manager_id,
                team_name,
                finish,
                power_rating,
                games_played,
                wins,
                losses,
                ties,
                moves,
                points_for,
                points_against,
                points_for_game_high,
                points_for_game_low,
                regular_season_wins,
                regular_season_losses,
                regular_season_ties,
                playoff_appearance,
                playoff_bye,
                playoff_wins,
                playoff_losses,
                championship_won
            )
            SELECT
                e.id,
                s.year - 2000,
                e.manager_id,
                e.team_name,
                e.finish,
                e.power_rating,
                e.games_played,
                e.wins,
                e.losses,
                e.ties,
                e.moves,
                e.points_for,
                e.points_against,
                e.points_for_game_high,
                e.points_for_game_low,
                e.regular_season_wins,
                e.regular_season_losses,
                e.regular_season_ties,
                e.playoff_appearance,
                e.playoff_bye,
                e.playoff_wins,
                e.playoff_losses,
                e.championship_won
            FROM season_entries_old e
            JOIN seasons_old s ON s.id = e.season_id
        `,
        `
            INSERT INTO dues (
                id,
                season_id,
                manager_id,
                paid,
                payment_method,
                updated_at
            )
            SELECT
                d.id,
                s.year - 2000,
                d.manager_id,
                d.paid,
                d.payment_method,
                d.updated_at
            FROM dues_old d
            JOIN seasons_old s ON s.id = d.season_id
        `,
        'DROP TABLE season_entries_old',
        'DROP TABLE dues_old',
        'DROP TABLE seasons_old',
        'CREATE UNIQUE INDEX seasons_year_unique ON seasons (year)',
        'CREATE UNIQUE INDEX season_entries_season_id_manager_id_unique ON season_entries (season_id, manager_id)',
        'CREATE UNIQUE INDEX dues_season_id_manager_id_unique ON dues (season_id, manager_id)',
        `UPDATE sqlite_sequence SET seq = ${maxSeasonId} WHERE name = 'seasons'`,
    ])

    const orphanedEntries = await client.execute(`
        SELECT COUNT(*) AS count
        FROM season_entries e
        LEFT JOIN seasons s ON s.id = e.season_id
        WHERE s.id IS NULL
    `)
    const orphanedDues = await client.execute(`
        SELECT COUNT(*) AS count
        FROM dues d
        LEFT JOIN seasons s ON s.id = d.season_id
        WHERE s.id IS NULL
    `)

    const entryCount = Number(orphanedEntries.rows[0]?.count ?? 0)
    const duesCount = Number(orphanedDues.rows[0]?.count ?? 0)
    if (entryCount > 0 || duesCount > 0) {
        throw new Error(
            `Season ID migration left orphaned rows: ${entryCount} season_entries, ${duesCount} dues.`
        )
    }

    console.table(
        mappings.map((mapping) => ({
            year: mapping.year,
            oldId: mapping.oldId,
            newId: mapping.newId,
        }))
    )
    console.log('Season ID migration complete.')
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
