import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, AuthError } from '@/app/lib/auth/server'

export async function GET() {
  try {
    const user = await requireAuth()
    return NextResponse.json({ displayName: user.displayName })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth()
    const { displayName } = await request.json()

    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
    }

    const trimmed = displayName.trim()
    if (trimmed.length < 2 || trimmed.length > 30) {
      return NextResponse.json({ error: 'Display name must be 2-30 characters' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { displayName: trimmed },
    })

    return NextResponse.json({ displayName: updated.displayName })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
