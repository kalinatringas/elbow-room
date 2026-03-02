import { Tabs } from 'expo-router';
import React from 'react';
import { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabaseClient';

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

  return (
    <View className='flex-1 justify-center items-center'>
      <Text>poop</Text>
      <TouchableOpacity
        onPress={signOut}
        disabled={loading}
        className={`rounded-xl py-3 items-center mt-2 p-2 ${
          loading ? "bg-indigo-400" : "bg-indigo-500 active:bg-indigo-600"
        }`}
          >
        Sign out
      </TouchableOpacity>
      </View>
  );
}
