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

    // Authenticate user via Supabase Auth
    const { user, error: authError } = await getServerUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { student_id } = body;

    if (!student_id) {
      return NextResponse.json(
        { error: 'student_id is required' },
        { status: 400 }
      );
    }

    // Get class from database using Prisma
    const classData = await prisma.class.findUnique({
      where: { id: class_id },
      select: {
        id: true,
        instructorId: true,
        livekitRoomName: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (!classData.livekitRoomName) {
      return NextResponse.json(
        { error: 'Class room not created' },
        { status: 400 }
      );
    }

    // Invite student to speak
    const controller = new LiveKitController();
    await controller.inviteToSpeak(
      {
        user_id: user.id,
        class_id: class_id,
        room_name: classData.livekitRoomName,
      },
      { student_id }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error inviting to speak:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
