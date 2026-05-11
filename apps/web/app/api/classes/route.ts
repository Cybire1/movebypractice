import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: {
        scheduledAt: 'asc'
      },
      select: {
        id: true,
        instructorId: true,
        title: true,
        description: true,
        scheduledAt: true,
        durationMinutes: true,
        maxStudents: true,
        status: true,
        chatEnabled: true,
        qaEnabled: true,
        donationsEnabled: true,
        participantCount: true,
        instructor: {
          select: {
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
