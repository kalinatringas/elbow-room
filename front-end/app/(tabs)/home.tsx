import { View, TouchableOpacity, Text, Alert, Image, FlatList } from "react-native"
import { router } from 'expo-router';
import { supabase } from "@/lib/supabaseClient"
import { useState, useEffect, useRef } from "react";
import Post from "@/components/Post";
import SearchBar from "@/components/SearchBar";
type PostItem = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
};
export default function HomePage(){
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef<number|null>(null);
  const TABS = ["Users", "Posts", "Tags"]
  const [activeTab, setActiveTab] = useState("Users");

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
      console.log("First post:", JSON.stringify(data.items[0], null, 2));
      setPosts(data.items);
    } catch (error){
      Alert.alert("Error", (error as Error).message);
    }finally{
      setPostsLoading(false)
    }
  }
  const handleSearch = async (text:string, tab:string)=>{
    setQuery(text);
    if(debounceRef.current) clearTimeout(debounceRef.current);
    if(text.length < 2){setResults([]); return;}
    const endpoint = tab === "Users" ? "users" : tab === "Posts" ? "posts" : "tags";
    debounceRef.current = setTimeout(async()=>{
      const {data : {session}} = await supabase.auth.getSession();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/search/${endpoint}?q=${text}`, { 
        headers: { 
          Authorization: `Bearer ${session?.access_token}` 
        } 
      });
      setResults(await res.json());
    },300)
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
       <View className='flex-1'>
              <View className="h-16"></View>
             <View className='flex-row justify-center items-center px-2 py-2'>
                <SearchBar onSubmit={handleSearch} />
             </View>
             
             <View className=" flex-1 w-full ">
              {postsLoading ? (
                <Text className="text-center">Loading posts...</Text>
              ):(
                <FlatList 
                  className="w-full"
                  data={posts}
                  extraData={posts}
                  keyExtractor={(item)=>item.id}
                  renderItem={({item})=>(
                    <Post author={item.profiles?.username ?? item.author_id} text={item.content} like_count={item.like_count} liked_by_me={item.liked_by_me} onLike={()=>onLike(item.id)} avatar_url={item.profiles?.avatar_url} />
                  )}
                  />
              )} 
              <View className="h-28"></View>  
             </View>   
             </View>  
    )
}