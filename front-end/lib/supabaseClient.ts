import 'react-native-url-polyfill/auto'
import Constants from 'expo-constants'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const expoExtra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>
const supabaseUrl = expoExtra.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = expoExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Only use AsyncStorage on native
const storage =
  Platform.OS === 'web'
    ? undefined // let Supabase use localStorage automatically
    : AsyncStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
   auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
})
