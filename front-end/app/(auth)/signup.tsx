import { useState } from "react";
import { View, TextInput, Text, Button, Alert,TouchableOpacity} from "react-native";
import { supabase } from "@/lib/supabaseClient";
import { router } from "expo-router";


export default function SignUp(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async ()=>{
        if (password !== confirmPassword){
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        setLoading(true);
        const {error} = await supabase.auth.signUp({email, password});
        setLoading(false);
        if (error){
            Alert.alert("Sign up error", error.message);
        } else{
            Alert.alert("Sign up success", "Check your email for a confirmation link", [
                {text : "OK", onPress: ()=> router.replace("/login")},
            ]);
        }
    };

    return (
        <View className="flex-1 px-6 items-center justify-center bg-zinc-100">   
        <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-indigo-500 items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">Logo</Text>
            </View>
            <Text className="text-indigo-500 text-3xl font-bold tracking-tight">Welcome</Text>
            <Text className="text-slate-400 text-sm mt-1">Create an account to get started</Text>
        </View>
        <View className="w-full bg-indigo-300 rounded-2xl p-6 gap-4 shadow-lg">
            <View className="gap-1">
                 <Text  className="text-slate-700 text-sm font-medium mb-1">Email</Text>
                 <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="#64748b"
                    className="bg-slate-800 text-white rounded-xl px-4 py-3 text-sm border border-slate-700"                    
                    />
            </View>
            <View className="gap-1">
                <Text className="text-slate-700 text-sm font-medium mb-1">Password</Text>
                <TextInput
                value={password}
                secureTextEntry={true}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                className="bg-slate-800 text-white rounded-xl px-4 py-3 text-sm border border-slate-700"                    
                />
            </View>
             <View className="gap-1">
                <Text className="text-slate-700 text-sm font-medium mb-1">Confirm Password</Text>
                <TextInput
                value={confirmPassword}
                secureTextEntry={true}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                className="bg-slate-800 text-white rounded-xl px-4 py-3 text-sm border border-slate-700"                    
                />
                {confirmPassword && password !== confirmPassword && (
                <Text className="text-red-600 text-s mt-1">Passwords do not match</Text>
                 )}
            </View>
            <Text className="text-indigo-400 text-sm text-right -mt-2">Forgot Password?</Text>
        </View>  
        
        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          className={`rounded-xl py-3 items-center mt-2 p-2 ${
            loading ? "bg-indigo-400" : "bg-indigo-500 active:bg-indigo-600"
          }`}
        >
          <Text className="text-white font-semibold text-sm">
            {loading ? "Signing up..." : "Sign up"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
            className="flex-row mt-6"
            onPress={() => router.replace("/login")}
            >
            <Text className="text-slate-400 text-sm">Don't have an account? </Text>
            <Text className="text-indigo-400 text-sm font-medium">Sign up</Text>
        </TouchableOpacity>
        </View>
    )

}