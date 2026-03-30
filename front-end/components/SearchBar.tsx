import { useState } from "react"
import { TextInput, TouchableOpacity, View } from "react-native"

type SearchBarProps = {
    searchInput : string;
    onSubmit: (content: string)=>void;
}

export default function SearchBar(){

    const [searchInput, setSearchInput] = useState("")

    function changeText(newText:string){
        setSearchInput(newText);
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
            <TouchableOpacity className="ml-2 bg-indigo-300 rounded-2xl text-center p-2">Submit</TouchableOpacity>
        </View>
    </>)
}