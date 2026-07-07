import { NextResponse } from 'next/server'
import { createAdminSession, verifyAdminPassword } from '@/lib/auth'
import { parseJsonBody } from '@/lib/api'
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

    const parsed = await parseJsonBody<{ password?: string }>(request)
    if ('error' in parsed) return parsed.error

    const password = String(parsed.data.password ?? '')

    if (!verifyAdminPassword(password)) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    await createAdminSession()
    return NextResponse.json({ ok: true })
}
