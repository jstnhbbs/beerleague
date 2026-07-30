import { NextResponse } from 'next/server'
import { parseJsonBody } from '@/lib/api'
import { getAdminSession, requireAdmin, updateAdminPassword, createAdminSession } from '@/lib/auth'

export async function POST(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = await parseJsonBody<{
        currentPassword?: string
        newPassword?: string
        confirmPassword?: string
    }>(request)
    if ('error' in parsed) return parsed.error

    const currentPassword = String(parsed.data.currentPassword ?? '')
    const newPassword = String(parsed.data.newPassword ?? '')
    const confirmPassword = String(parsed.data.confirmPassword ?? '')

    if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
            { error: 'All password fields are required' },
            { status: 400 }
        )
    }

    if (newPassword !== confirmPassword) {
        return NextResponse.json(
            { error: 'New passwords do not match' },
            { status: 400 }
        )
    }

    const result = await updateAdminPassword(
        session.id,
        currentPassword,
        newPassword
    )

    if (result === 'invalid-current') {
        return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 401 }
        )
    }

    if (result === 'invalid-new') {
        return NextResponse.json(
            { error: 'New password must be at least 8 characters' },
            { status: 400 }
        )
    }

    await createAdminSession(session.id)

    return NextResponse.json({ ok: true })
}
