/**
 * Update Streak API Route
 * POST /api/user/update-streak
 * Updates daily login streak
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerUser } from '@/app/lib/auth/server'

export async function POST() {
  try {
    // Authenticate user
    const { user, error: authError } = await getServerUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current stats
    const stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    if (!stats) {
      return NextResponse.json(
        { error: 'User stats not found' },
        { status: 404 }
      )
    }

    // Calculate streak logic
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastActive = stats.lastActiveDate
      ? new Date(stats.lastActiveDate)
      : null

    // If already active today, no change needed
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0)
      if (lastActive.getTime() === today.getTime()) {
        return NextResponse.json({
          streak: stats.streak,
          alreadyUpdatedToday: true,
        })
      }
    }

    // Check if yesterday was last active (streak continues)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak: number
    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
      // Streak continues
      newStreak = stats.streak + 1
    } else {
      // Streak broken, start fresh
      newStreak = 1
    }

    // Update stats
    const updatedStats = await prisma.userStats.update({
      where: { userId: user.id },
      data: {
        streak: newStreak,
        lastActiveDate: today,
      },
    })

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'streak_updated',
        metadata: {
          oldStreak: stats.streak,
          newStreak,
          streakBroken: newStreak === 1 && stats.streak > 1,
        },
      },
    })

    return NextResponse.json({
      streak: updatedStats.streak,
      alreadyUpdatedToday: false,
    })
  } catch (error) {
    console.error('Error updating streak:', error)
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    )
  }
}
