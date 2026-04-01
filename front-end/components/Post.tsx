import { View,Text, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons";

type Props ={
    author: string,
    text: string,
    like_count: number,
    liked_by_me?:boolean,
    avatar_url?: string,
    onLike: ()=>void;
}

export default function Post({author, text, like_count, liked_by_me, avatar_url, onLike}:Props){
    //

    return(
        <View className="bg-indigo-300 rounded-xl m-2 p-4">
            <View className="flex-row items-center mb-2">
                {avatar_url ? (
                    <Image source={{ uri: avatar_url }} className="w-10 h-10 rounded-full mr-3" />
                ) : (
                    <View className="w-10 h-10 rounded-full bg-gray-400 mr-3" />
                )}
                <Text className="text-lg font-medium">{author}</Text>
            </View>
            <Text className="text-center mb-2">{text}</Text>
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