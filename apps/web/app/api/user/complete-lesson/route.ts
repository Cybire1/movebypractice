/**
 * Complete Lesson API Route
 * POST /api/user/complete-lesson
 * Marks lesson as complete and awards XP (with auto-leveling)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerUser } from '@/app/lib/auth/server'
import type { Prisma } from '@prisma/client'

const XP_PER_LEVEL = 1000

export async function POST(request: Request) {
  try {
    // Authenticate user
    const { user, error: authError } = await getServerUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { lessonId, xpReward, timeSpentMinutes, codeSubmitted } = body

    if (!lessonId || !xpReward) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, xpReward' },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Upsert lesson progress
      const progress = await tx.userProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lessonId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
          attempts: { increment: 1 },
          timeSpentMinutes: timeSpentMinutes || 0,
          codeSubmitted: codeSubmitted || null,
        },
        create: {
          userId: user.id,
          lessonId: lessonId,
          completed: true,
          completedAt: new Date(),
          attempts: 1,
          timeSpentMinutes: timeSpentMinutes || 0,
          codeSubmitted: codeSubmitted || null,
        },
      })

      // 2. Get current stats
      let stats = await tx.userStats.findUnique({
        where: { userId: user.id },
      })

      // Create stats if they don't exist (fallback for missing trigger)
      if (!stats) {
        stats = await tx.userStats.create({
          data: {
            userId: user.id,
            xp: 0,
            level: 1,
            streak: 0,
          },
        })
      }

      // 3. Calculate new XP and level
      const newXP = stats.xp + xpReward
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
      const leveledUp = newLevel > stats.level

      // 4. Update stats
      const updatedStats = await tx.userStats.update({
        where: { userId: user.id },
        data: {
          xp: newXP,
          level: newLevel,
          totalLessonsCompleted: { increment: 1 },
          totalTimeSpentMinutes: {
            increment: timeSpentMinutes || 0,
          },
          lastActiveDate: new Date(),
        },
      })

      // 5. Log analytics event
      await tx.analyticsEvent.create({
        data: {
          userId: user.id,
          eventType: 'lesson_completed',
          metadata: {
            lessonId,
            xpAwarded: xpReward,
            leveledUp,
            newLevel,
            timeSpent: timeSpentMinutes || 0,
          },
        },
      })

      return {
        progress,
        stats: updatedStats,
        leveledUp,
        xpAwarded: xpReward,
      }
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    )
  }
}
