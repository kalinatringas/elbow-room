import { Stack, usePathname, useRouter, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import "../global.css"
export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const segments = useSegments()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loading) return

    const path = pathname

    if (!session && path !== '/landing') {
      router.replace('/landing')
    } else if (session && path === '/landing') {
      router.replace('/home')
    }
  }, [session, loading, pathname])

  if (loading) return null

  return <Stack screenOptions={{ headerShown: false }} />
}