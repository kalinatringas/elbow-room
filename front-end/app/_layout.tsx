import { Stack, usePathname, useRouter, useSegments } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import "../global.css"


export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const segments = useSegments()

  const redirect = useCallback(async (session: Session | null)=>{
    const inAuthGroup = segments[0] === '(tabs)'

    if(!session){
      router.replace('/landing')
      return
    }

    if (session && !inAuthGroup){
      const {data} = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single()

      if (data?.username && data?.avatar_url){
        router.replace('/home')
      } else{
        router.replace('/setup')
      }
    }
  }, [segments])



  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log("initial session:", data.session?.user?.email ?? "null")
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)  
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loading) return

    const path = pathname
    if (!session && path !== '/landing') {
      console.log("→ no session, redirecting to landing")
      router.replace('/landing')
    } else if (session && path === '/landing') {
      console.log("→ has session on landing, checking profile")
      checkProfile()
    } else if (session && path === '/setup'){
      console.log("→ has session on landing, checking profile")
      return
    }
  }, [session, loading, pathname])

  const checkProfile = async () =>{
    const {data} = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', session?.user.id)
      .single()

      if (data?.username && data?.avatar_url ){
        router.replace('/home')
      } else{
        router.replace('/setup')
      }
  }

  if (loading) return null

  return <Stack screenOptions={{ headerShown: false }} />
}