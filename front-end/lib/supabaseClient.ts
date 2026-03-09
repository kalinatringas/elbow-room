import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const MOCK_MODE = true // 👈 flip to false when Supabase is ready

const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (_event: any, _cb: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (row: any) => Promise.resolve({ data: row, error: null }),
    update: (row: any) => Promise.resolve({ data: row, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
} as any

const realClient = MOCK_MODE
  ? mockClient
  : createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: Platform.OS === 'web' ? undefined : AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: Platform.OS === 'web',
        },
      }
    )

export const supabase = realClient