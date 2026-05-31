import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // Surfaced in the console to make misconfiguration obvious during setup.
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env')
}

// Left untyped intentionally: once the Supabase project exists, generate a
// Database type (Supabase CLI / generate_typescript_types) and pass it here as
// createClient<Database>(...). The row types in ./types are used app-side.
export const supabase = createClient(url, anonKey)
