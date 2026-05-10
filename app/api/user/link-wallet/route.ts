import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth, AuthError } from '@/app/lib/auth/server'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { walletAddress } = await request.json()

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 })
    }

    // Validate Sui address format (0x followed by 64 hex chars)
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/
    if (!suiAddressRegex.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid Sui wallet address' }, { status: 400 })
    }

    // Check if wallet is already linked to another user
    const existing = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        { error: 'This wallet is already linked to another account' },
        { status: 409 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress },
    })

    return NextResponse.json({ walletAddress: updated.walletAddress })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Error linking wallet:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
