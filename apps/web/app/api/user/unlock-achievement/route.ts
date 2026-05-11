/**
 * Unlock Achievement API Route
 * POST /api/user/unlock-achievement
 * Unlocks a new achievement for the user
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerUser } from '@/app/lib/auth/server'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const { user, error: authError } = await getServerUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { achievementId } = body

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Missing required field: achievementId' },
        { status: 400 }
      )
    }

    // Check if achievement already unlocked
    const existing = await prisma.achievement.findUnique({
      where: {
        userId_achievementId: {
          userId: user.id,
          achievementId: achievementId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Achievement already unlocked', alreadyUnlocked: true },
        { status: 400 }
      )
    }

    // Unlock achievement
    const achievement = await prisma.achievement.create({
      data: {
        userId: user.id,
        achievementId: achievementId,
        unlockedAt: new Date(),
      },
    })

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'achievement_unlocked',
        metadata: {
          achievementId,
          unlockedAt: achievement.unlockedAt,
        },
      },
    })

    return NextResponse.json({
      success: true,
      achievement: {
        id: achievement.achievementId,
        unlockedAt: achievement.unlockedAt,
      },
    })
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    )
  }
}
