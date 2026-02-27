import { supabase } from '../lib/supabaseClient'

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password })
}

