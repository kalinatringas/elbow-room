import { Image } from 'expo-image';
import { View,Text } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
export default function Profile() {  
    
  const [profile, setProfile] = useState<any>(null);
  
    useEffect(()=>{
      const fetchProfile = async ()=>{
        const {data:{user}} = await supabase.auth.getUser();
        const {data, error} = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id",user?.id)
        .single();
        if (!error) setProfile(data)
      };
    fetchProfile();
    }, [])

  return (
   <View className="flex-1 items-center justify-center bg-white">
      <View className='absolute top-0 bg-indigo-200 rounded-b-xl p-3 w-full items-center'>
        <Image source={{uri: profile?.avatar_url}} className='w-24 h-24 rounded-full'/>
      <Text className="text-xl font-bold text-slate-800">
        {profile?.name}    
      </Text>
      </View>
      
    </View>
  );
} 