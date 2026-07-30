import './load-env'
import { createClient } from '@libsql/client'

async function migrateAdminSessionVersion() {
    const url = process.env.TURSO_DATABASE_URL ?? 'file:local.db'
    const authToken = process.env.TURSO_AUTH_TOKEN
    const client = createClient(
        authToken ? { url, authToken } : { url }
    )

    const tableExists = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='admin_users'"
    )
    if (tableExists.rows.length === 0) {
        console.log('No admin_users table found; nothing to migrate.')
        return
    }

    const columns = await client.execute('PRAGMA table_info(admin_users)')
    const columnNames = columns.rows.map((row) => row.name as string)

    if (columnNames.includes('session_version')) {
        console.log('Admin users table already has session_version.')
        return
    }

    console.log('Adding session_version column to admin_users...')
    await client.execute(
        'ALTER TABLE admin_users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0'
    )
    console.log('Admin session migration complete.')
}

migrateAdminSessionVersion().catch((error) => {
    console.error(error)
    process.exit(1)
})
