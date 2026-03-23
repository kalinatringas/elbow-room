import { View,Text } from "react-native"
import { Ionicons } from "@expo/vector-icons";

type Props ={
    author: string,
    text: string,
    like_count: number,
}

export default function Post({author, text, like_count}:Props){
    return(
        <View className="bg-indigo-300 rounded-xl m-2">
            <Text className="text-lg text-center font-medium">{author}</Text>
            <Text className="text-center">{text}</Text>
            <Ionicons name="heart-outline" size={32}  color="white"/>
            <Text>{like_count}</Text>
        </View>
    ) 
}