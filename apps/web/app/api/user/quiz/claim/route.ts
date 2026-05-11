import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, AuthError } from '@/app/lib/auth/server'

const QUIZ_XP_REWARD = 50

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { quizId } = await request.json()

    if (!quizId || typeof quizId !== 'string') {
      return NextResponse.json({ error: 'quizId is required' }, { status: 400 })
    }

    // Check if already claimed — idempotent
    const existing = await prisma.analyticsEvent.findFirst({
      where: {
        userId: user.id,
        eventType: 'quiz_xp_claimed',
        metadata: { path: ['quizId'], equals: quizId },
      },
    })

    if (existing) {
      return NextResponse.json({ alreadyClaimed: true, xpAwarded: 0 })
    }

    // Record the claim
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'quiz_xp_claimed',
        metadata: { quizId },
      },
    })

    // Award XP
    const stats = await prisma.userStats.update({
      where: { userId: user.id },
      data: { xp: { increment: QUIZ_XP_REWARD } },
    })

    // Recalculate level
    const newLevel = Math.floor(stats.xp / 1000) + 1
    if (newLevel !== stats.level) {
      await prisma.userStats.update({
        where: { userId: user.id },
        data: { level: newLevel },
      })
    }

    return NextResponse.json({
      alreadyClaimed: false,
      xpAwarded: QUIZ_XP_REWARD,
      totalXp: stats.xp,
      level: newLevel,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Error claiming quiz XP:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
