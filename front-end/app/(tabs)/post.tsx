import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { View, Text } from 'react-native';
import PostForm from '@/components/PostForm';

export default function CreatePost() {
  function handlePost(text:string){
    console.log("New post:", text);
  }
  return (
    <View className="flex-1 items-center justify-center bg-white">
       <Text className="text-xl font-bold text-purple-500">
          What's on your mind?
        </Text>
       
      <PostForm onSubmit={handlePost} />
      </View>
  );
}

