/**
 * Supabase Client Configuration
 * Browser-side Supabase client for client components
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

// Placeholders used during build when real env vars are not set.
// The client will instantiate but any network call will fail at runtime,
// which is exactly what we want: build passes, app fails loudly only when used.
const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'placeholder-anon-key'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY

  if (
    typeof window !== 'undefined' &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing — auth will not work.'
    )
  }

  return createBrowserClient<Database>(url, key)
}

// Singleton instance for browser
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}
