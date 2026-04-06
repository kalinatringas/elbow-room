import { View,Text, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Props ={
    author: string,
    text: string,
    author_id: string,
    like_count: number,
    liked_by_me?:boolean,
    avatar_url?: string,
    onLike: ()=>void;
}

export default function Post({author, text, author_id, like_count, liked_by_me, avatar_url, onLike}:Props){
    //
    const handleShowUser=()=>{
        router.push(`/(tabs)/${author_id}`);
        
    }
    return(
        <View className="bg-indigo-300 rounded-xl m-2 p-4">
            <View className="flex-row items-center w-full mb-2">
                <TouchableOpacity
                className="flex-row items-center justify-around"
                onPress={handleShowUser}>
                    {avatar_url ? (
                        <Image source={{ uri: avatar_url }} className="w-12 h-12 rounded-full mr-3" />
                    ) : (
                        <View className="w-12 h-12 rounded-full bg-gray-400 mr-3" />
                    )}
                    <Text className="text-lg text-right font-medium">@{author}</Text>
                </TouchableOpacity>        
            </View>
            <Text className="text-left mb-2">{text}</Text>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center ">
                    <TouchableOpacity
                    onPress={onLike}>
                        <Ionicons name={liked_by_me? "heart": "heart-outline"} 
                        size={32} 
                        color={liked_by_me? "red": "white"}/>
                    </TouchableOpacity>
                    <Text className="ml-2">{like_count}</Text>
                </View>
            </View>
        </View>
    ) 
}