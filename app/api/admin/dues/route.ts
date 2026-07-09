import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { parseJsonBody } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { dues } from '@/lib/db/schema'
import { normalizePaymentMethod } from '@/lib/dues'
import { getDuesTracker } from '@/lib/queries'

interface DuesUpdate {
    managerId?: unknown
    paid?: unknown
    paymentMethod?: unknown
}

interface DuesUpdateRequest {
    dues?: DuesUpdate[]
}

interface ValidatedDuesUpdate {
    managerId: number
    paid: boolean
    paymentMethod: string | null
    updatedAt: string
}

export async function PUT(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = await parseJsonBody<DuesUpdateRequest>(request)
    if ('error' in parsed) return parsed.error

    if (!Array.isArray(parsed.data.dues)) {
        return NextResponse.json(
            { error: 'Dues updates are required' },
            { status: 400 }
        )
    }

    const tracker = await getDuesTracker()
    const activeManagerIds = new Set(
        tracker.rows.map((row) => row.managerId)
    )

    const updates: ValidatedDuesUpdate[] = []
    const updatedAt = new Date().toISOString()

    for (const row of parsed.data.dues) {
        const managerId = Number(row.managerId)
        const paid = row.paid === true
        const paymentMethod = paid
            ? normalizePaymentMethod(row.paymentMethod)
            : null

        if (!Number.isInteger(managerId) || !activeManagerIds.has(managerId)) {
            return NextResponse.json(
                { error: 'Invalid active manager' },
                { status: 400 }
            )
        }

        if (paid && !paymentMethod) {
            return NextResponse.json(
                { error: 'Payment method is required for paid managers' },
                { status: 400 }
            )
        }

        updates.push({
            managerId,
            paid,
            paymentMethod,
            updatedAt,
        })
    }

    if (updates.length === 0) {
        return NextResponse.json({ ok: true })
    }

    try {
        await db
            .insert(dues)
            .values(updates)
            .onConflictDoUpdate({
                target: dues.managerId,
                set: {
                    paid: sql`excluded.paid`,
                    paymentMethod: sql`excluded.payment_method`,
                    updatedAt: sql`excluded.updated_at`,
                },
            })
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to update dues'
        return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
