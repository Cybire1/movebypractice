import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Upsert to handle duplicates gracefully
    await prisma.waitlist.upsert({
      where: { email: email.toLowerCase() },
      create: { email: email.toLowerCase() },
      update: {},
    })

    const count = await prisma.waitlist.count()

    return NextResponse.json({ success: true, position: count })
  } catch (err) {
    console.error('Error adding to waitlist:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const count = await prisma.waitlist.count()
    return NextResponse.json({ count })
  } catch (err) {
    console.error('Error getting waitlist count:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
