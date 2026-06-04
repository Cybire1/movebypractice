/**
 * Supabase Client Configuration
 * Browser-side Supabase client for client components
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>

export function createClient(): SupabaseBrowserClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null during build/SSR when env vars are not configured.
  // Auth-dependent UI must handle a null client gracefully.
  if (!url || !key) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing — auth disabled.'
      )
    }
    return null
  }

  return createBrowserClient<Database>(url, key)
}

// Singleton instance for browser
let supabaseInstance: SupabaseBrowserClient | null = null
let hasInitialised = false

export function getSupabase(): SupabaseBrowserClient | null {
  if (!hasInitialised) {
    supabaseInstance = createClient()
    hasInitialised = true
  }
  return supabaseInstance
}
