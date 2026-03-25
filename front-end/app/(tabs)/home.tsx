import { View, TouchableOpacity, Text, Alert, Image, FlatList } from "react-native"
import { router } from 'expo-router';
import { supabase } from "@/lib/supabaseClient"
import { useState, useEffect } from "react";
import Post from "@/components/Post";

export default function HomePage(){
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
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

  const getPosts = async ()=>{
    setPostsLoading(true);
    try{
      const {data : {session}} = await supabase.auth.getSession();
      const response = await   fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/`,{
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
      .select("username, avatar_url")
      .eq("id",user?.id)
      .single();
      if (!error) setProfile(data)
    };
  fetchProfile();
  getPosts();
  }, [])

    return(
       <View className='flex-1 justify-center items-center'>
             <View className='top-0 right-0 fixed'>
             <TouchableOpacity
               onPress={signOut}
               disabled={loading}
               className={`rounded-xl text-white py-3 items-center m-1 p-2${
                 loading ? "bg-indigo-400" : "bg-indigo-400 active:bg-indigo-500"
               }`}
                 >
                   <Text>Sign Out</Text>
             </TouchableOpacity>
             </View>
             <View className="w-full justify-center">
              {postsLoading ? (
                <Text className="text-center">Loading posts...</Text>
              ):(
                <FlatList 
                  className="w-full"
                  data={posts}
                  keyExtractor={(item)=>item.id}
                  renderItem={({item})=>(
                    <Post author={item.profiles?.username ?? item.author_id} text={item.content} like_count={item.like_count} />
                  )}
                  />
              )}   
             </View>   
             </View>  
    )
}