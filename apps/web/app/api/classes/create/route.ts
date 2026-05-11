import { NextRequest, NextResponse } from 'next/server';
import { LiveKitController, ClassMetadata } from '@/app/lib/livekit/controller';
import { getServerUser } from '@/app/lib/auth/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user via Supabase Auth
    const { user, error: authError } = await getServerUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { class_id } = body;

    if (!class_id) {
      return NextResponse.json(
        { error: 'class_id is required' },
        { status: 400 }
      );
    }

    // Get class from database using Prisma
    const classData = await prisma.class.findUnique({
      where: { id: class_id },
      select: {
        id: true,
        instructorId: true,
        chatEnabled: true,
        qaEnabled: true,
        donationsEnabled: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify user is the instructor
    if (classData.instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can start the class' },
        { status: 403 }
      );
    }

    // Create LiveKit room
    const controller = new LiveKitController();
    const metadata: ClassMetadata = {
      instructor_id: user.id,
      class_id: class_id,
      chat_enabled: classData.chatEnabled,
      qa_enabled: classData.qaEnabled,
      donations_enabled: classData.donationsEnabled,
    };

    const response = await controller.createClass({
      class_id,
      instructor_id: user.id,
      metadata,
    });

    // Update class in database with LiveKit room info using Prisma
    await prisma.class.update({
      where: { id: class_id },
      data: {
        livekitRoomName: response.room_name,
        livekitMetadata: metadata,
        status: 'live',
        startedAt: new Date(),
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
