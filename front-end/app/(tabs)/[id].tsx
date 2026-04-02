import { Image } from 'expo-image';
import { View, Text, FlatList, Alert, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Image as RNImage } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import Post from '@/components/Post';

type FriendStatus = "none" | "pending_sent" | "pending_received" | "accepted";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>(); // this grabs id from search bar 
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("none");
  const [friendLoading, setFriendLoading] = useState(false);

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
    //console.log("fetching profile for id:", id); 
    const headers = await getAuthHeader();
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/${id}`, { headers });
   // console.log("profile status:", res.status)
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
  // const fetchFriendStatus = async () => {
  //   const headers = await getAuthHeader();
  //   const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/status/${id}`, { headers });
  //   const data = await res.json();
  //   if (data.status === "pending") {
  //     setFriendStatus(data.sent_by_me ? "pending_sent" : "pending_received");
  //   } else {
  //     setFriendStatus(data.status);
  //   }
  // };

  // const handleFriendAction = async () => {
  //   setFriendLoading(true);
  //   const headers = await getAuthHeader();
  //   try {
  //     if (friendStatus === "none") {
  //       await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/request/${id}`, { method: "POST", headers });
  //       setFriendStatus("pending_sent");
  //     } else if (friendStatus === "pending_received") {
  //       await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/accept/${id}`, { method: "POST", headers });
  //       setFriendStatus("accepted");
  //     } else if (friendStatus === "accepted") {
  //       await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/${id}`, { method: "DELETE", headers });
  //       setFriendStatus("none");
  //     }
  //   } catch (e) {
  //     Alert.alert("Error", "Something went wrong");
  //   } finally {
  //     setFriendLoading(false);
  //   }
  // };

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

  const friendButtonLabel = () => {
    switch (friendStatus) {
      case "none": return "Add Friend";
      case "pending_sent": return "Pending...";
      case "pending_received": return "Accept Request";
      case "accepted": return "Friends ";
    }
  };

  const friendButtonStyle = () => {
    switch (friendStatus) {
      case "none": return "bg-indigo-500";
      case "pending_sent": return "bg-gray-400";
      case "pending_received": return "bg-green-500";
      case "accepted": return "bg-indigo-200";
    }
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
              <TouchableOpacity
                // onPress={handleFriendAction}
                disabled={friendLoading || friendStatus === "pending_sent"}
                className={`py-2 px-6 rounded-full ${friendButtonStyle()}`}
              >
                {friendLoading
                  ? <ActivityIndicator color="white" />
                  : <Text className="text-white font-semibold">{friendButtonLabel()}</Text>
                }
              </TouchableOpacity>
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
            <View className='h-28'></View>
            </View>
    </View>
    </ImageBackground>
  );
}