import {View, Text, TextInput, TouchableOpacity, useWindowDimensions} from 'react-native'; // renders something
import {useState} from 'react'; // tracks what user is typing
import {StyleSheet} from 'react-native'; // styles for button

// defines the props that the PostForm component expects to receive
// lowkey don't know what this do 
type Props = {
    onSubmit: (content: string) => void; // function that takes content and does something with it
}

export default function PostForm(props: Props){    
    const [textbox, setTextBox] = useState(""); // content starts as empty string
    const [error, setError] = useState(""); // validation state
    const {height} = useWindowDimensions();
    // VALIDATION LOGIC
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

        props.onSubmit(textbox);
        setTextBox(""); // clear text box after submit
    }

    // ERROR Handling logic
    let errorMessage = null;
    if(error !== ""){
        errorMessage = <Text>{error}</Text>;
    }
    

   return (
    <View className='w-full'>
        <View className='bg-indigo-100 rounded-xl w-full'>
            <TextInput
                className='p-3 m-2 self-stretch'
                style={{ textAlignVertical: 'top', maxHeight: height * 0.7, minHeight: 48 }}
                value={textbox}
                onChangeText={changeText}
                placeholder="Type here..."
                placeholderTextColor="#DAB1DA"
                multiline={true}
            />
            {errorMessage}
        </View>
        <TouchableOpacity className="rounded-xl bg-[#DAB1DA] p-2 mt-2" onPress={formSubmit}>
            <Text>Submit</Text>
        </TouchableOpacity>
    </View>
);
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#DAB1DA',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    }
})
