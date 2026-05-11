import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, AuthError } from '@/app/lib/auth/server'

export async function GET() {
  try {
    const user = await requireAuth()

    const stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    const completedLessons = await prisma.userProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true },
    })

    return NextResponse.json({
      stats: stats || { xp: 0, level: 1, streak: 0 },
      completedLessons: completedLessons.map((p) => p.lessonId),
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { xp, level, streak, completedLessons, completedQuizzes, completedExercises } = body

    // Update stats — server values win for xp/level, merge arrays
    const updateData: Record<string, unknown> = {}
    if (typeof xp === 'number') updateData.xp = xp
    if (typeof level === 'number') updateData.level = level
    if (typeof streak === 'number') updateData.streak = streak

    if (Object.keys(updateData).length > 0) {
      await prisma.userStats.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...updateData },
        update: updateData,
      })
    }

    // Upsert completed lessons
    if (Array.isArray(completedLessons)) {
      for (const lessonId of completedLessons) {
        await prisma.userProgress.upsert({
          where: { userId_lessonId: { userId: user.id, lessonId } },
          create: {
            userId: user.id,
            lessonId,
            completed: true,
            completedAt: new Date(),
          },
          update: {},
        })
      }
    }

    // Store completed quizzes/exercises as analytics events
    if (Array.isArray(completedQuizzes)) {
      for (const quizId of completedQuizzes) {
        await prisma.analyticsEvent.upsert({
          where: { id: `${user.id}-quiz-${quizId}` },
          create: {
            userId: user.id,
            eventType: 'quiz_completed',
            metadata: { quizId },
          },
          update: {},
        }).catch(() => {
          // Ignore duplicate — the unique constraint is on id, use create with findFirst
        })
      }
    }

    if (Array.isArray(completedExercises)) {
      for (const exerciseId of completedExercises) {
        await prisma.analyticsEvent.upsert({
          where: { id: `${user.id}-exercise-${exerciseId}` },
          create: {
            userId: user.id,
            eventType: 'exercise_completed',
            metadata: { exerciseId },
          },
          update: {},
        }).catch(() => {
          // Ignore duplicate
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Error syncing stats:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
