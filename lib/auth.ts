import { createHmac, timingSafeEqual } from 'crypto'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { normalizeAdminUsername } from '@/lib/admin-users'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { verifyPassword } from '@/lib/password'

const COOKIE_NAME = 'beerleague_admin_session'
const DEV_SESSION_SECRET = 'dev-only-change-me'

export interface AdminSession {
    id: number
    username: string
    displayName: string
}

interface SessionPayload {
    adminUserId: number
    sessionVersion: number
}

function getSessionSecret(): string {
    const secret = process.env.ADMIN_SESSION_SECRET

    if (process.env.NODE_ENV === 'production') {
        if (!secret || secret === DEV_SESSION_SECRET) {
            throw new Error(
                'ADMIN_SESSION_SECRET must be set to a strong value in production'
            )
        }
        return secret
    }

    return secret ?? DEV_SESSION_SECRET
}

function signSession(adminUserId: number, sessionVersion: number): string {
    const payload = `${adminUserId}:${sessionVersion}`
    const signature = createHmac('sha256', getSessionSecret())
        .update(payload)
        .digest('hex')
    return `${payload}.${signature}`
}

function parseSessionToken(token: string): SessionPayload | null {
    const separator = token.lastIndexOf('.')
    if (separator === -1) return null

    const payload = token.slice(0, separator)
    const signature = token.slice(separator + 1)
    const [adminUserIdPart, sessionVersionPart] = payload.split(':')

    const adminUserId = Number(adminUserIdPart)
    const sessionVersion = Number(sessionVersionPart)

    if (
        !Number.isInteger(adminUserId) ||
        adminUserId <= 0 ||
        !Number.isInteger(sessionVersion) ||
        sessionVersion < 0
    ) {
        return null
    }

    const expected = createHmac('sha256', getSessionSecret())
        .update(payload)
        .digest('hex')

    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null

    return { adminUserId, sessionVersion }
}

async function getAdminSessionVersion(
    adminUserId: number
): Promise<number | null> {
    const rows = await db
        .select({ sessionVersion: adminUsers.sessionVersion })
        .from(adminUsers)
        .where(eq(adminUsers.id, adminUserId))
        .limit(1)

    return rows[0]?.sessionVersion ?? null
}

export async function verifyAdminCredentials(
    username: string,
    password: string
): Promise<AdminSession | null> {
    const normalizedUsername = normalizeAdminUsername(username)
    if (!normalizedUsername || !password) return null

    const rows = await db
        .select({
            id: adminUsers.id,
            username: adminUsers.username,
            displayName: adminUsers.displayName,
            passwordHash: adminUsers.passwordHash,
        })
        .from(adminUsers)
        .where(eq(adminUsers.username, normalizedUsername))
        .limit(1)

    const admin = rows[0]
    if (!admin) return null

    const valid = await verifyPassword(password, admin.passwordHash)
    if (!valid) return null

    return {
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
    }
}

export async function createAdminSession(adminUserId: number): Promise<void> {
    const sessionVersion = await getAdminSessionVersion(adminUserId)
    if (sessionVersion === null) return

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, signSession(adminUserId, sessionVersion), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    })
}

export async function clearAdminSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

export async function getAdminSession(): Promise<AdminSession | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(COOKIE_NAME)?.value
        if (!token) return null

        const payload = parseSessionToken(token)
        if (!payload) return null

        const rows = await db
            .select({
                id: adminUsers.id,
                username: adminUsers.username,
                displayName: adminUsers.displayName,
                sessionVersion: adminUsers.sessionVersion,
            })
            .from(adminUsers)
            .where(eq(adminUsers.id, payload.adminUserId))
            .limit(1)

        const admin = rows[0]
        if (!admin || admin.sessionVersion !== payload.sessionVersion) {
            return null
        }

        return {
            id: admin.id,
            username: admin.username,
            displayName: admin.displayName,
        }
    } catch {
        return null
    }
}

export async function isAdmin(): Promise<boolean> {
    return (await getAdminSession()) !== null
}

/** Returns true when the request has a valid admin session. */
export async function requireAdmin(): Promise<boolean> {
    return isAdmin()
}

export async function updateAdminPassword(
    adminUserId: number,
    currentPassword: string,
    newPassword: string
): Promise<'invalid-current' | 'invalid-new' | 'ok'> {
    if (newPassword.length < 8) return 'invalid-new'

    const rows = await db
        .select({
            passwordHash: adminUsers.passwordHash,
            sessionVersion: adminUsers.sessionVersion,
        })
        .from(adminUsers)
        .where(eq(adminUsers.id, adminUserId))
        .limit(1)

    const admin = rows[0]
    if (!admin) return 'invalid-current'

    const valid = await verifyPassword(currentPassword, admin.passwordHash)
    if (!valid) return 'invalid-current'

    const { hashPassword } = await import('@/lib/password')
    const passwordHash = await hashPassword(newPassword)
    const updatedAt = new Date().toISOString()

    await db
        .update(adminUsers)
        .set({
            passwordHash,
            updatedAt,
            sessionVersion: admin.sessionVersion + 1,
        })
        .where(eq(adminUsers.id, adminUserId))

    return 'ok'
}
