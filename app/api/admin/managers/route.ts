import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { managers } from '@/lib/db/schema'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const name = String(body.name ?? '').trim()
    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const slug = slugify(name)
    const existing = await db
        .select()
        .from(managers)
        .where(eq(managers.slug, slug))
        .limit(1)

    if (existing[0]) {
        return NextResponse.json(
            { error: 'Manager already exists' },
            { status: 409 }
        )
    }

    const inserted = await db
        .insert(managers)
        .values({
            name,
            slug,
            createdAt: new Date().toISOString(),
        })
        .returning()

    return NextResponse.json(inserted[0])
}
