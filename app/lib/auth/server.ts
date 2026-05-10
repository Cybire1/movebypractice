/**
 * Server-Side Authentication Utilities
 * Verifies Supabase Auth tokens on the server
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/app/lib/prisma'

export async function getServerUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return { user, error }
}

/**
 * Require authentication and return the Prisma DB user.
 * Upserts the user if they don't exist in Prisma yet (handles OAuth first-login).
 * Throws a structured error if not authenticated.
 */
export async function requireAuth() {
  const { user: supabaseUser, error } = await getServerUser()

  if (error || !supabaseUser) {
    throw new AuthError('Unauthorized', 401)
  }

  const email = supabaseUser.email || ''
  const username = email.split('@')[0] || supabaseUser.id.slice(0, 8)
  const avatarUrl =
    supabaseUser.user_metadata?.avatar_url ||
    supabaseUser.user_metadata?.picture ||
    null

  // Upsert user in Prisma
  const dbUser = await prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email,
      username,
      avatarUrl,
    },
    update: {
      email,
      avatarUrl,
    },
  })

  // Ensure stats exist
  await prisma.userStats.upsert({
    where: { userId: supabaseUser.id },
    create: { userId: supabaseUser.id },
    update: {},
  })

  return dbUser
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
