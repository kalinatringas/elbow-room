import { useState } from "react"
import { TextInput, TouchableOpacity, View } from "react-native"

type SearchBarProps = {
    searchInput : string;
    onSubmit: (content: string, tabs: string)=>void;
    TABS: 
}

export default function SearchBar({searchInput, onSubmit}: SearchBarProps){

    const [text, setText] = useState("")

    function changeText(newText:string){
        setText(newText);
        //clearError();
    }


    return(<>
        <View className="p-2 flex-row w-full">
            <TextInput
                className="p-3 self-stretch w-full bg-white rounded-2xl border-black text-black" 
                value={searchInput}
                onChangeText={changeText}
                placeholder="Search here..."
                placeholderTextColor="#a1a1aa"
            />
            <TouchableOpacity className="ml-2 bg-indigo-300 rounded-2xl text-center p-2"
                onPress={onSubmit}
            >Submit</TouchableOpacity>
            <
        </View>
    </>)
}