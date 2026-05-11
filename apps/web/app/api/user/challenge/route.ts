import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, AuthError } from '@/app/lib/auth/server'

export async function GET() {
  try {
    const user = await requireAuth()

    const stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
      select: {
        challengeStreak: true,
        longestChallengeStreak: true,
        lastChallengeDate: true,
        totalChallengesCompleted: true,
      },
    })

    return NextResponse.json({
      challengeStreak: stats?.challengeStreak || 0,
      longestChallengeStreak: stats?.longestChallengeStreak || 0,
      lastChallengeDate: stats?.lastChallengeDate || null,
      totalChallengesCompleted: stats?.totalChallengesCompleted || 0,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const user = await requireAuth()

    const stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastDate = stats?.lastChallengeDate
      ? new Date(stats.lastChallengeDate)
      : null

    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0)
    }

    // Already completed today
    if (lastDate && lastDate.getTime() === today.getTime()) {
      return NextResponse.json({
        alreadyCompleted: true,
        challengeStreak: stats?.challengeStreak || 0,
      })
    }

    // Check if streak continues (completed yesterday)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = lastDate && lastDate.getTime() === yesterday.getTime()

    const newStreak = isConsecutive ? (stats?.challengeStreak || 0) + 1 : 1
    const longestStreak = Math.max(newStreak, stats?.longestChallengeStreak || 0)

    const updated = await prisma.userStats.update({
      where: { userId: user.id },
      data: {
        challengeStreak: newStreak,
        longestChallengeStreak: longestStreak,
        lastChallengeDate: today,
        totalChallengesCompleted: { increment: 1 },
      },
    })

    return NextResponse.json({
      alreadyCompleted: false,
      challengeStreak: updated.challengeStreak,
      longestChallengeStreak: updated.longestChallengeStreak,
      totalChallengesCompleted: updated.totalChallengesCompleted,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Error completing challenge:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
