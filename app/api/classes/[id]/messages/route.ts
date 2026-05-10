import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params

    const messages = await prisma.classMessage.findMany({
      where: { classId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { username: true, displayName: true },
        },
      },
      take: 200,
    })

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('Error loading messages:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
