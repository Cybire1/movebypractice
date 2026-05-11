import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, AuthError } from '@/app/lib/auth/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: classId, messageId } = await params
    const { content } = await request.json()

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    // Find the message
    const message = await prisma.classMessage.findUnique({
      where: { id: messageId },
    })

    if (!message || message.classId !== classId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Only the author can edit
    if (message.userId !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 })
    }

    const updated = await prisma.classMessage.update({
      where: { id: messageId },
      data: { content: content.trim() },
    })

    return NextResponse.json({ message: updated })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Error editing message:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: classId, messageId } = await params

    const message = await prisma.classMessage.findUnique({
      where: { id: messageId },
    })

    if (!message || message.classId !== classId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Author or class instructor can delete
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    })

    if (message.userId !== user.id && classData?.instructorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.classMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Error deleting message:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
