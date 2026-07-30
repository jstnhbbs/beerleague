import { NextResponse } from 'next/server'
import { createAdminSession, verifyAdminCredentials } from '@/lib/auth'
import { parseJsonBody } from '@/lib/api'
import { normalizeAdminUsername } from '@/lib/admin-users'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

const LOGIN_LIMIT = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
    const ip = getClientIp(request)
    const limit = rateLimit(`admin-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)

    if (!limit.allowed) {
        return NextResponse.json(
            { error: 'Too many login attempts. Try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(
                        Math.ceil(limit.retryAfterMs / 1000)
                    ),
                },
            }
        )
    }

    const parsed = await parseJsonBody<{
        username?: string
        password?: string
    }>(request)
    if ('error' in parsed) return parsed.error

    const username = normalizeAdminUsername(parsed.data.username)
    const password = String(parsed.data.password ?? '')

    if (!username || !password) {
        return NextResponse.json(
            { error: 'Username and password are required' },
            { status: 400 }
        )
    }

    const admin = await verifyAdminCredentials(username, password)
    if (!admin) {
        return NextResponse.json(
            { error: 'Invalid username or password' },
            { status: 401 }
        )
    }

    await createAdminSession(admin.id)
    return NextResponse.json({
        ok: true,
        displayName: admin.displayName,
    })
}
