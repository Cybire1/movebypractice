import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, AuthError } from '@/app/lib/auth/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: classId } = await params

    // Get the class
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: { select: { bookings: { where: { status: 'booked' } } } },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (classData.status !== 'scheduled') {
      return NextResponse.json({ error: 'Class is no longer available for booking' }, { status: 400 })
    }

    // Check capacity
    if (classData._count.bookings >= classData.maxStudents) {
      return NextResponse.json({ error: 'Class is full' }, { status: 409 })
    }

    // Can't book your own class
    if (classData.instructorId === user.id) {
      return NextResponse.json({ error: 'Instructors cannot book their own class' }, { status: 400 })
    }

    // Upsert booking (idempotent)
    const booking = await prisma.classBooking.upsert({
      where: {
        userId_classId: { userId: user.id, classId },
      },
      create: {
        userId: user.id,
        classId,
        status: 'booked',
      },
      update: {
        status: 'booked',
      },
    })

    return NextResponse.json({ booking })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Error booking class:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
