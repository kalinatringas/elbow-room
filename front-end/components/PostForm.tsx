import {View, Text, TextInput, TouchableOpacity} from 'react-native'; // renders something
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
    

    return(
        <View>
            <Text>Do you like cats?</Text>
            <TextInput
                value={textbox}
                onChangeText={changeText}
                placeholder="Type here..." // hint text
                placeholderTextColor="#DAB1DA"
            />
            {errorMessage}  {/*// if null, nothing prints. if value, prints.*/}
        
            <TouchableOpacity style = {styles.button} onPress={formSubmit}>
                <Text>Submit</Text>
            </TouchableOpacity>
            {/* touchable opacity is a rapper to  */}
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
