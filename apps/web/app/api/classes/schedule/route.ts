import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/app/lib/auth/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await getServerUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to schedule a class' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      scheduledAt,
      durationMinutes,
      maxStudents,
      chatEnabled,
      qaEnabled,
      donationsEnabled,
    } = body;

    // Validation
    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Title and scheduled time are required' },
        { status: 400 }
      );
    }

    // Create class in database
    const newClass = await prisma.class.create({
      data: {
        instructorId: user.id,
        title,
        description: description || '',
        scheduledAt: new Date(scheduledAt),
        durationMinutes,
        maxStudents,
        chatEnabled,
        qaEnabled,
        donationsEnabled,
        status: 'scheduled'
      }
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error('Error scheduling class:', error);
    return NextResponse.json(
      { error: 'Failed to schedule class' },
      { status: 500 }
    );
  }
}
