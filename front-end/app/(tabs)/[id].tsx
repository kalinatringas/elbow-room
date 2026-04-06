import { Image } from 'expo-image';
import { View, Text, FlatList, Alert, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Image as RNImage } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import Post from '@/components/Post';
import FriendButton from '@/components/FriendButton';


export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>(); // this grabs id from search bar 
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session?.access_token}` };
  };

  useEffect(() => {
    const init = async () => {
      // redirect to own profile tab if viewing yourself
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === id) {
        router.replace('/(tabs)/profile');
        return;
      }
      fetchProfile();
      fetchPosts();
      //fetchFriendStatus();
    };
    init();
  }, [id]);

  const fetchProfile = async () => {

    const headers = await getAuthHeader();
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/${id}`, { headers });
    if (res.ok) setProfile(await res.json());
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${id}/post`, { headers });
      console.log(id);
      const data = await res.json();
      console.log("posts data: ", JSON.stringify(data, null, 2))
      setPosts(data.items ?? []);
    } catch (e) {
      Alert.alert("Error", "Could not load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const onLike = async (postID: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/${postID}/like`, {
      method: "POST", headers
    });
    if (!res.ok) return;
    const { liked, like_count } = await res.json();
    setPosts(prev => prev.map(p =>
      p.id === postID ? { ...p, liked_by_me: liked, like_count } : p
    ));
  };

  

  return (
     <ImageBackground 
          source={require('../../assets/Paper(2).jpg')} 
          style={{ flex: 1 }}
          resizeMode="repeat"
          >
    <View className="flex-1 ">
      <View className="flex-row items-center px-4 pt-3 pb-3 bg-indigo-200">
        <TouchableOpacity onPress={() => router.back()} className='pt-10'>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>
       <View className="items-center bg-indigo-200 pb-4 rounded-b-xl">
         {profile?.avatar_url && (
                          <RNImage   
                            source={{ uri: profile.avatar_url }}
                            className='w-24 h-24 rounded-full'
                            resizeMode="cover"
                          />
                        )}            
            <Text className="text-xl font-bold text-slate-800 mt-2">{profile?.name}</Text>
            <Text className="text-slate-600">@{profile?.username}</Text>
            {profile?.bio && <Text className="text-slate-500 mt-1 text-center px-6">{profile.bio}</Text>}
            <View className='flex-row mt-3 items-center gap-3'>
              <FriendButton userId={id}/>
               <Text className="text-slate-500 mt-1">{profile?.friend_count ?? 0} friends</Text>
            </View>
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
                <Post author={item.profiles?.username ?? item.author_id} avatar_url={profile.avatar_url} text={item.content} liked_by_me={item.liked_by_me} author_id={item.author_id} onLike={()=>onLike(item.id)} like_count={item.like_count} />
              )}
            />)}
            <View className='h-24'></View>
            </View>
    </View>
    </ImageBackground>
  );
}