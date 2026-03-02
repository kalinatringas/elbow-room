import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import FloatingNav from '@/components/FloatingNav';
//// put stuff here that you would like tosee across different pages
export default function TabLayout() {
  const [loading, setLoading] = useState(false);
  const signOut = async () => {
    setLoading(true);
    const {error} = await supabase.auth.signOut();
    setLoading(false);
    if (error){
      Alert.alert("Error Signing out", error.message);
    }
  }
  const [profile, setProfile] = useState<any>(null);
  useEffect(()=>{
    const fetchProfile = async ()=>{
      const {data:{user}} = await supabase.auth.getUser();
      const {data, error} = await supabase
      .from("profiles")
      .select("username")
      .eq("id",user?.id)
      .single();
      if (!error) setProfile(data)

    console.log("user:", user);
    console.log("data:", data);
    console.log("error:", error);
    };
  fetchProfile();
  }, [])

  return (
    <View className='flex-1 justify-center items-center'>
      {/* For debugging not for prod */}
      <View className='top-0 right-0 fixed'>
      <TouchableOpacity
        onPress={signOut}
        disabled={loading}
        className={`rounded-xl text-white py-3 items-center m-1 p-2  ${
          loading ? "bg-indigo-400" : "bg-indigo-400 active:bg-indigo-500"
        }`}
          >
            <Text>Sign Out</Text>
      </TouchableOpacity>
      </View>
      <View>
        <Text>Welcome {profile?.username}</Text>
      </View>
      {/* The navbar */}
      <FloatingNav active='home'/>
      </View>
  );
}
