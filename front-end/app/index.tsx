import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';

// root path: just redirect quickly to login or home depending on session
export default function Index() {


  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" />
    </View>
  );
}
