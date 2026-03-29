import { Image } from 'expo-image';
import { View,Text, FlatList,Alert } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import Post from '@/components/Post';
export default function Profile() {  
    
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
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
        setPosts(data);
      } catch (error){
        Alert.alert("Error", (error as Error).message);
      }finally{
        setPostsLoading(false)
      }
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
   <View className="flex-1 items-center justify-center bg-white">
      <View className='absolute top-0 bg-indigo-200 rounded-b-xl p-3 w-full items-center'>
        <Image source={{uri: profile?.avatar_url}} className='w-24 h-24 rounded-full'/>
      <Text className="text-xl font-bold text-slate-800">
        {profile?.name}    
      </Text>
      </View>
      <View className='justify-center w-full'>
         {postsLoading? (
        <Text>Loading posts... </Text>
      ):(<FlatList
        data = {posts}
        className='w-full'
        keyExtractor={(item)=>item.id}
         renderItem={({item})=>(
          <Post author={item.profiles?.username ?? item.author_id} text={item.content} like_count={item.like_count} />
        )}
      />)}
      </View>
     
    </View>
  );
} 