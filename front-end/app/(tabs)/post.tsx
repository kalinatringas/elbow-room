import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { View, Text } from 'react-native';
import PostForm from '@/components/PostForm';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function CreatePost() {
  const [loading, setLoading] = useState(false)
  const handlePost = async (text:string) =>{
    setLoading(true);
    try{
      const {data : {session}} = await supabase.auth.getSession();
 
      const response = await fetch("http://localhost:8000/posts/",{ //replace with deplayed BE 
            method: "POST",
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({content:text}),
        });
      if (!response.ok){
        const err = await response.json();
        console.log("Full error:", JSON.stringify(err))
        throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
      }
      console.log("post created");
    } catch (error){
      console.error("post failed: ", (error as Error).message);
    } finally{
      setLoading(false)
    }
  }
  
  return (
    <View className="flex-1 items-center justify-center bg-white">      
      <PostForm onSubmit={handlePost} loading={loading}/>
      </View>
  );
}

