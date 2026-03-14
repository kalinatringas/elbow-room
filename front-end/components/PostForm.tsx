import {View, Text, TextInput, TouchableOpacity, useWindowDimensions, NativeSyntheticEvent, TextInputContentSizeChangeEvent} from 'react-native'; // renders something
import {useState} from 'react'; // tracks what user is typing
import {StyleSheet} from 'react-native'; // styles for button
import {TextInputContentSizeChangeEventData} from 'react-native'
import { useRef } from 'react';
// defines the props that the PostForm component expects to receive
// lowkey don't know what this do 
type Props = {
    onSubmit: (content: string) => void; // function that takes content and does something with it
    loading?: boolean;
}

export default function PostForm({ onSubmit, loading = false }: Props){    
    const [textbox, setTextBox] = useState(""); // content starts as empty string
    const [error, setError] = useState(""); // validation state
    const [inputHeight, setInputHeight] = useState(300);
    // VALIDATION LOGIC
    const inputRef = useRef<TextInput>(null)

    function validate(){
        if(textbox== "" || !textbox.trim()){ // if empty or just spaces print error
            setError("Can't leave me blank!");
            return false;
        }
        setError("");
        return true;
    };

    function clearError(){ // clears error message
        if(error !== ""){ 
            setError("");
        }
    }

    function changeText(newText:string){
        setTextBox(newText);
        clearError();
    }

  
    function formSubmit(){
        const isValid = validate();
        if(isValid === false){
            return; // don't submit form
        }
        console.log("Submitted", textbox);

        onSubmit(textbox);
        setTextBox(""); // clear text box after submit
        setInputHeight(48);
    }

    // ERROR Handling logic
    let errorMessage = null;
    if(error !== ""){
        errorMessage = <Text>{error}</Text>;
    }
    

   return (
    <View className='w-full p-3'>
        <View className='bg-indigo-100 rounded-xl w-full'>
            <TextInput
                className='p-3 m-2 self-stretch'
                ref={inputRef}
                value={textbox}
                onChangeText={changeText}
                placeholder="So... what's on your mind?"
                placeholderTextColor="#DAB1DA"
                multiline={true}
                scrollEnabled={false}
            />
            {errorMessage}
        </View>
        <TouchableOpacity className="rounded-xl bg-[#DAB1DA] p-2 mt-2" 
            onPress={formSubmit}
            disabled={loading}>
            <Text className='text-center text-lg text-pink-900'>{loading ? "Posting..." : "Post"}</Text>
        </TouchableOpacity>
    </View>
);
}