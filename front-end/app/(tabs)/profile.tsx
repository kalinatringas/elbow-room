import { Image } from 'expo-image';
import { View,Text, FlatList,Alert, Modal, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

import { Ionicons } from "@expo/vector-icons";

import Post from '@/components/Post';
export default function Profile() {  
    
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLike = async (postID:string)=>{
    // fetch current like count, increase 
    try{
      const{data:{session}}= await supabase.auth.getSession();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/${postID}/like`,{
        method: "POST",
        headers:{
          Authorization: `Bearer ${session?.access_token}`
        },
      });
      if (!response.ok){
        throw new Error("Failed to toggle like");
      }
      const {liked, like_count} = await response.json();
      setPosts(prev=>
        prev.map(p=>
          p.id === postID
          ?{...p, liked_by_me:liked, like_count:like_count}
          : p
        )
      );
    }catch(error){
      Alert.alert("Error", (error as Error).message);
    }
  }
  const getPosts = async ()=>{
      setPostsLoading(true);
      try{
        const {data : {session}} = await supabase.auth.getSession();
        const response = await   fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/me`,{
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          },
        });
        if (!response.ok){
          const err = await response.json();
          console.log("Full error:", JSON.stringify(err))
          throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
        }
        const data = await response.json();
        setPosts(data.items);
      } catch (error){
        Alert.alert("Error", (error as Error).message);
      }finally{
        setPostsLoading(false)
      }
    }
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
  const editProfile = async () => {
    router.replace('/editprofile');
  }
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
  getPosts();

  }, [])

  return (
   <View className="flex-1 bg-white">
      <View className='flex-row bg-indigo-200 rounded-b-xl p-3 w-full justify-between items-center'>
        <View>
          <Ionicons name='mail-outline' size={32} color="white"/>
        </View>
        <View className='flex-col'>
          <View className='h-12'></View>
          <Image source={{uri: profile?.avatar_url}} className='w-24 h-24 rounded-full'/>
          <Text className="text-xl font-bold text-center text-slate-800">{profile?.name}</Text>
        </View>
        <TouchableOpacity onPress={()=>setMenuActive(true)}>
          <Ionicons name="menu-outline" size={32} color="white"/>
        </TouchableOpacity>
      </View>
      <View className='w-full flex-1'>
         {postsLoading? (
        <Text>Loading posts... </Text>
      ):(<FlatList
        data = {posts}
        extraData={posts}
        className='w-full'
        keyExtractor={(item)=>item.id}
         renderItem={({item})=>(
          <Post author={item.profiles?.username ?? item.author_id} avatar_url={profile.avatar_url} text={item.content} liked_by_me={item.liked_by_me} onLike={()=>onLike(item.id)} like_count={item.like_count} />
        )}
      />)}
      <View className='h-12'></View>
      </View>
      {/* The menu pop  up */}
      {menuActive && 
       ( <Modal transparent animationType='fade' onRequestClose={()=>setMenuActive(false)} className='bg-pink-400'>
          <TouchableOpacity className='flex-1 bg-black/50 items-center' onPress={()=>setMenuActive(false)}>
            <TouchableOpacity
            activeOpacity={1}
            onPress={e=>e.stopPropagation()}
            className='bg-white rounded-2xl p-6 w-3/4 m-auto'>
              <Text className='text-lg text-center font-bold mb-4'>Menu</Text>
              <TouchableOpacity
                onPress={signOut} 
                className='bg-indigo-400 rounded-xl py-3 m-1 items-center'>
                  <Text className='text-white font-semibold'>Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  editProfile()
                  setMenuActive(false)
                }}
                className='bg-indigo-400 rounded-xl py-3 m-1 items-center'>
                <Text className='text-white font-semibold'>Edit Profile</Text>
              </TouchableOpacity>
               <TouchableOpacity onPress={() => setMenuActive(false)} className="mt-3 items-center">
              <Text className="text-slate-500">Close</Text>
            </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
      </Modal>)
      } 
    </View>
  );
} 