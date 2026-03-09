import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { supabase, MOCK_MODE } from '@/lib/supabaseClient';
import FloatingNav from '@/components/FloatingNav';

export default function TabLayout() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) Alert.alert("Error Signing out", error.message);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // In mock mode, skip Supabase and use fake profile
      if (MOCK_MODE) {
        setProfile({ username: 'DevUser' });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
    };

    fetchProfile();
  }, []);

  return (
    // ✅ Tabs must be the root — this renders your actual tab screens
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Overlay UI that appears on every tab */}
      <View
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={signOut}
          disabled={loading}
          className={`rounded-xl py-3 items-center m-1 p-2 ${
            loading ? "bg-indigo-400" : "bg-indigo-400 active:bg-indigo-500"
          }`}
        >
          <Text className="text-white">Sign Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500">
          Welcome {profile?.username ?? '...'}
        </Text>
      </View>

      <FloatingNav active="home" />
    </Tabs>
  );
}