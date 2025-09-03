import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function createSupabaseMock() {
  const notConfiguredError = new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env')

  const from = () => ({
    insert: () => ({
      select: async () => ({ data: null, error: notConfiguredError }),
    }),
  })

  const functions = {
    invoke: async () => ({ data: null, error: notConfiguredError }),
  }

  // Minimal surface used by the app
  return { from, functions } as any
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : createSupabaseMock()

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing. Using safe mock client.')
}
