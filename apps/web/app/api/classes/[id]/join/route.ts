import { NextRequest, NextResponse } from 'next/server';
import { LiveKitController } from '@/app/lib/livekit/controller';
import { getServerUser } from '@/app/lib/auth/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: class_id } = await params;
    console.log('Join API called for class:', class_id);

    // Authenticate user via Supabase Auth
    const { user, error: authError } = await getServerUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get class from database using Prisma
    const classData = await prisma.class.findUnique({
      where: { id: class_id },
      select: {
        id: true,
        instructorId: true,
        status: true,
        livekitRoomName: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if class is live
    if (classData.status !== 'live') {
      return NextResponse.json(
        { error: 'Class is not live yet' },
        { status: 400 }
      );
    }

    if (!classData.livekitRoomName) {
      return NextResponse.json(
        { error: 'Class room not created' },
        { status: 400 }
      );
    }

    // Get user profile using Prisma
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        avatarUrl: true,
      },
    });

    // Check if user is the instructor
    const isInstructor = classData.instructorId === user.id;
    console.log('🔍 Instructor check:', {
      classInstructorId: classData.instructorId,
      currentUserId: user.id,
      isInstructor,
    });

    // Join LiveKit room with appropriate permissions
    const controller = new LiveKitController();
    let response;

    if (isInstructor) {
      // Instructor gets full publishing permissions
      response = await controller.joinClassAsInstructor({
        room_name: classData.livekitRoomName,
        user_id: user.id,
        username: userProfile?.username || user.email || 'Instructor',
        avatar_url: userProfile?.avatarUrl || undefined,
      });
    } else {
      // Regular student with limited permissions
      response = await controller.joinClass({
        room_name: classData.livekitRoomName,
        user_id: user.id,
        username: userProfile?.username || user.email || 'Anonymous',
        avatar_url: userProfile?.avatarUrl || undefined,
      });
    }

    // Create or update booking using Prisma
    await prisma.classBooking.upsert({
      where: {
        userId_classId: {
          userId: user.id,
          classId: class_id,
        },
      },
      update: {
        status: 'attended',
      },
      create: {
        userId: user.id,
        classId: class_id,
        status: 'attended',
      },
    });

    // Increment participant count using Prisma
    await prisma.class.update({
      where: { id: class_id },
      data: {
        participantCount: {
          increment: 1,
        },
      },
    });

    const responseData = {
      ...response,
      metadata: {
        is_instructor: isInstructor,
        user_id: user.id,
      },
    };

    console.log('Join API response data:', JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error('Error joining class:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
