import { View, TouchableOpacity, Text, Alert, Image } from "react-native"
import { router } from 'expo-router';
import FloatingNav from "@/components/FloatingNav"
import { supabase } from "@/lib/supabaseClient"
import { useState, useEffect } from "react";

export default function HomePage(){
  const [loading, setLoading] = useState(false);
  const signOut = async () => {
    setLoading(true);
    const {error} = await supabase.auth.signOut();
    setLoading(false);
    if (error){
      Alert.alert("Error Signing out", error.message);
    } else {
      // return to login screen
      router.replace('/landing');
    }
  }
  const [profile, setProfile] = useState<any>(null);
  useEffect(()=>{
    const fetchProfile = async ()=>{
      const {data:{user}} = await supabase.auth.getUser();
      const {data, error} = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id",user?.id)
      .single();
      if (!error) setProfile(data)
    };
  fetchProfile();
  }, [])

    return(
       <View className='flex-1 justify-center items-center'>
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
              <View className="items-center">
                <Text>Welcome {profile?.username}</Text>
                <Image source={{uri: profile?.avatar_url}} className="w-24 h-24 rounded-full"/>
              </View>               
             </View>  
    )
}