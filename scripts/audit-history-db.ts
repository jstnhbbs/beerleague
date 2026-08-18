import './load-env'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL ?? 'file:local.db'
const authToken = process.env.TURSO_AUTH_TOKEN
const client = createClient(authToken ? { url, authToken } : { url })

async function main() {
    const rows = await client.execute(`
        SELECT s.year,
               e.finish,
               e.team_name,
               m.name AS manager_name,
               e.regular_season_wins || '-' || e.regular_season_losses || '-' || e.regular_season_ties AS record,
               e.points_for,
               e.points_against,
               e.moves
        FROM season_entries e
        JOIN seasons s ON s.id = e.season_id
        JOIN managers m ON m.id = e.manager_id
        WHERE s.year BETWEEN 2015 AND 2025
        ORDER BY s.year, e.finish
    `)

    console.table(rows.rows)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
