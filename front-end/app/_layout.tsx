import { Stack, usePathname, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import "../global.css"


export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)  
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])


  useEffect(() => {
    if (loading) return
    if (!session){
      router.replace('/landing')
    } else{
      checkProfile(session.user.id)
    }
  }, [session, loading])
  const checkProfile = async (userId: string) =>{
    const {data} = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', userId)
      .single()

      if (data?.username && data?.avatar_url ){
        router.replace('/home')
      } else{
        router.replace('/setup')
      }
  }
 // if (loading) return null

  return <Stack screenOptions={{ headerShown: false }} />
}