import { supabase } from '../lib/supabaseClient'

export const createPost = async (content: string, userId: string) => {
  return await supabase.from('posts').insert({
    author_id: userId,
    content,
  })
}