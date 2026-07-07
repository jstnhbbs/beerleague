import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'beerleague_admin_session'
const DEV_SESSION_SECRET = 'dev-only-change-me'

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

function signSession(): string {
    return createHmac('sha256', getSessionSecret())
        .update('beerleague-admin')
        .digest('hex')
}

export function verifyAdminPassword(password: string): boolean {
    const expected = process.env.ADMIN_PASSWORD
    if (!expected) return false

    const a = Buffer.from(password)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
}

export async function createAdminSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, signSession(), {
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

export async function isAdmin(): Promise<boolean> {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get(COOKIE_NAME)?.value
        if (!session) return false

        const expected = signSession()
        const a = Buffer.from(session)
        const b = Buffer.from(expected)
        if (a.length !== b.length) return false
        return timingSafeEqual(a, b)
    } catch {
        return false
    }
}

/** Returns true when the request has a valid admin session. */
export async function requireAdmin(): Promise<boolean> {
    return isAdmin()
}
