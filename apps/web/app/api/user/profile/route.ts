/**
 * User Profile API Route
 * GET /api/user/profile
 * Returns complete user profile with stats, progress, and achievements
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerUser } from '@/app/lib/auth/server'

export async function GET() {
  try {
    // Authenticate user via Supabase Auth
    const { user, error: authError } = await getServerUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query user profile with all relations (Prisma handles the join)
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        stats: true,
        progress: {
          where: { completed: true },
          orderBy: { completedAt: 'desc' },
          select: {
            lessonId: true,
            completed: true,
            completedAt: true,
            timeSpentMinutes: true,
            attempts: true,
          },
        },
        achievements: {
          orderBy: { unlockedAt: 'desc' },
          select: {
            achievementId: true,
            unlockedAt: true,
          },
        },
      },
    })

    // If user doesn't exist in database, create default profile
    if (!userProfile) {
      // Create user record
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || null,
          username: user.email?.split('@')[0] || null,
        },
      })

      // Create default stats (this would normally be done by database trigger)
      const newStats = await prisma.userStats.create({
        data: {
          userId: user.id,
          xp: 0,
          level: 1,
          streak: 0,
        },
      })

      return NextResponse.json({
        user: newUser,
        stats: newStats,
        completedLessons: [],
        achievements: [],
      })
    }

    // Format response for client
    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        username: userProfile.username,
        avatarUrl: userProfile.avatarUrl,
        walletAddress: userProfile.walletAddress,
      },
      stats: userProfile.stats || {
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: null,
        totalLessonsCompleted: 0,
        totalTimeSpentMinutes: 0,
      },
      completedLessons: userProfile.progress.map((p: { lessonId: string }) => p.lessonId),
      progressDetails: userProfile.progress,
      achievements: userProfile.achievements.map((a: { achievementId: string; unlockedAt: Date }) => ({
        id: a.achievementId,
        unlockedAt: a.unlockedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
