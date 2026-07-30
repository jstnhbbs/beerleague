import './load-env'
import { eq } from 'drizzle-orm'
import { ADMIN_ACCOUNTS } from '../lib/admin-users'
import { db } from '../lib/db'
import { adminUsers } from '../lib/db/schema'
import { hashPassword } from '../lib/password'

async function seedAdmins() {
    const timestamp = new Date().toISOString()
    let seededCount = 0

    for (const account of ADMIN_ACCOUNTS) {
        const password = process.env[account.passwordEnv]
        if (!password) {
            console.warn(
                `Skipping ${account.username}: set ${account.passwordEnv} to seed this account`
            )
            continue
        }

        const passwordHash = await hashPassword(password)

        await db
            .insert(adminUsers)
            .values({
                username: account.username,
                displayName: account.displayName,
                passwordHash,
                createdAt: timestamp,
                updatedAt: timestamp,
            })
            .onConflictDoUpdate({
                target: adminUsers.username,
                set: {
                    displayName: account.displayName,
                    passwordHash,
                    updatedAt: timestamp,
                },
            })

        seededCount += 1
        console.log(`Seeded admin account: ${account.username}`)
    }

    if (seededCount === 0) {
        console.error(
            'No admin accounts were seeded. Set ADMIN_PASSWORD_PAUL, ADMIN_PASSWORD_GARRETT, and/or ADMIN_PASSWORD_JUSTIN.'
        )
        process.exit(1)
    }

    console.log(`Admin seed complete (${seededCount} account(s)).`)
}

seedAdmins().catch((error) => {
    console.error(error)
    process.exit(1)
})
