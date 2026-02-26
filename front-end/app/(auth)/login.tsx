import { useState } from "react";
import { View, TextInput, Text, Button, Alert } from "react-native";
import { supabase } from "@/lib/supabaseClient";
import { router } from "expo-router";

export default function Login(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async ()=>{
        setLoading(true)
        const {error} = await supabase.auth.signInWithPassword({
            email,
            password
        })
        setLoading(false)
        if (error){
            Alert.alert("Login error", error.message)
        }else{
            router.replace('/(tabs)')
        }
    }
    return(
        <View className="flex-1 items-center justify-center bg-red-50">   
        <Text>Email</Text>
        <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style= {{ borderWidth:1 , padding: 8}}
        />
        <Text>Password</Text>
        <TextInput
        value={password}
        secureTextEntry={true}
        onChangeText={setPassword}
        autoCapitalize="none"
        style = {{borderWidth: 1, padding: 8}}
        />
        <Button
        title = {loading ? "Logging in...":"Login"}
        onPress={handleLogin}
        />
        </View>
    )
}