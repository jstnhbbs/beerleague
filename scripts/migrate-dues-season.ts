import './load-env'
import { createClient } from '@libsql/client'

async function migrateDuesToSeasonScope() {
    const url = process.env.TURSO_DATABASE_URL ?? 'file:local.db'
    const authToken = process.env.TURSO_AUTH_TOKEN
    const client = createClient(
        authToken ? { url, authToken } : { url }
    )

    const tableExists = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='dues'"
    )
    if (tableExists.rows.length === 0) {
        console.log('No dues table found; nothing to migrate.')
        return
    }

    const columns = await client.execute('PRAGMA table_info(dues)')
    const columnNames = columns.rows.map(
        (row) => row.name as string
    )

    if (columnNames.includes('season_id')) {
        console.log('Dues table is already season-scoped.')
        return
    }

    const latestSeason = await client.execute(
        'SELECT id FROM seasons ORDER BY year DESC LIMIT 1'
    )
    if (latestSeason.rows.length === 0) {
        throw new Error(
            'Cannot migrate dues without at least one season in the database.'
        )
    }

    const seasonId = latestSeason.rows[0].id as number

    console.log(
        `Migrating dues records to season ${seasonId} (latest season)...`
    )

    await client.batch([
        `CREATE TABLE dues_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            season_id INTEGER NOT NULL,
            manager_id INTEGER NOT NULL,
            paid INTEGER DEFAULT false NOT NULL,
            payment_method TEXT,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (season_id) REFERENCES seasons(id),
            FOREIGN KEY (manager_id) REFERENCES managers(id)
        )`,
        `INSERT INTO dues_new (season_id, manager_id, paid, payment_method, updated_at)
         SELECT ${seasonId}, manager_id, paid, payment_method, updated_at FROM dues`,
        'DROP TABLE dues',
        'ALTER TABLE dues_new RENAME TO dues',
        'CREATE UNIQUE INDEX dues_season_id_manager_id_unique ON dues (season_id, manager_id)',
    ])

    console.log('Dues migration complete.')
}

migrateDuesToSeasonScope().catch((error) => {
    console.error(error)
    process.exit(1)
})
