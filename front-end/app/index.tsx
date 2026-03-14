import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';

// root path: just redirect quickly to login or home depending on session
export default function Index() {
  const router = useRouter();

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data }) => {
  //     if (data.session) router.replace('/home');
  //     else router.replace('/landing');
  //   });
  // }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" />
    </View>
  );
}
