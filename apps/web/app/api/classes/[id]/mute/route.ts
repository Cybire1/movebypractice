import { NextResponse } from 'next/server'
import { LiveKitController, getSessionFromReq } from '@/app/lib/livekit/controller'

const livekit = new LiveKitController()

export async function POST(request: Request) {
  try {
    const session = getSessionFromReq(request)
    const { student_id, mute } = await request.json()

    if (!student_id || typeof student_id !== 'string') {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 })
    }

    if (mute === false) {
      // Unmute = invite to speak
      await livekit.inviteToSpeak(session, { student_id })
    } else {
      // Mute = remove speaking permission
      await livekit.removeFromSpeaking(session, { student_id })
    }

    return NextResponse.json({ success: true, muted: mute !== false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status = message.includes('instructor') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
