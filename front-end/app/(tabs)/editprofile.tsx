import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, Image } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker'

export default function EditProfile(){
    const [profile, setProfile] = useState<any>(null)
    const [name, setName] = useState(profile?.name);
    // const [bio, setBio] = useState("");
    const [username, setUserName] = useState(profile?.username);
    const [loading, setLoading] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [uploading, setUploading]= useState(false);

    const pickImage = async ()=>{
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted"){
            Alert.alert("Permission Needed", "Please allow access to your camera roll")
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes:  "images",
            allowsEditing: true,
            aspect: [1,1],
            quality: 0.5
        });
        if (!result.canceled){
            setAvatarUri(result.assets[0].uri);
        }
    }
    
    const uploadAvatar = async (userId: string) =>{
        if (!avatarUri) return null;
        if (!userId) return null;
        setUploading(true);
        try{
            const {data : {session}} = await supabase.auth.getSession();

            const imageResponse= await fetch(avatarUri);
            const blob = await imageResponse.blob();
    
            const formData = new FormData();
            formData.append("file", blob, "avatar.jpg");
    
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload-avatar`,{
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: formData,
            });
            if (!response.ok){
                const err = await response.json();
                console.log("FastAPI error:", err); 
                throw new Error("Upload Failed");
            }
    
            const data = await response.json();
            return data.avatar_url as string;
        } catch (error){
            Alert.alert("Upload Failed", (error as Error).message);
            return null;
        } finally{
            setUploading(false);
        }
    }
    
    const handleProfile = async () =>{
        setLoading(true);
        try {
            const {data : {session}} = await supabase.auth.getSession();
            const {data : {user}} = await supabase.auth.getUser();
            if (!user) throw new Error ("user not found");

            const formData = new FormData();
            if(name) formData.append("name", name);
            if(username) formData.append("username", username);
            if(avatarUri){
                const imageResponse= await fetch(avatarUri);
                const blob = await imageResponse.blob();
                formData.append("file", blob, "avatar.jpg");
            }
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`,{
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: formData,
            });
            if (!response.ok){
                const err = await response.text();
                console.log("FastAPI error:", err); 
                throw new Error("Upload Failed");
            }
            console.log("profile has been updated")
            router.replace("/profile")
        } catch (error){
            Alert.alert("Error", (error as Error).message);
        } finally{
            setLoading(false);
            router.replace("/home")
        }
    }
    useEffect(()=>{
        const fetchProfile = async ()=>{
            const {data:{user}} = await supabase.auth.getUser();
            const {data, error} = await supabase
            .from("profiles")
            .select("name, username, avatar_url")
            .eq("id",user?.id)
            .single();
            if (!error) setProfile(data)
        };
        fetchProfile();
    }, [])

    useEffect(()=>{
        if(profile){
            setName(profile.name || "")
            setUserName(profile.username || "")
            setAvatarUri(profile.avatar_url || null);
        }
    }, [profile]);

    return(
    <SafeAreaView className="bg-indigo-300 flex-1 items-center justify-center">
        <View className="p-5 m-auto">
            <TouchableOpacity onPress={pickImage} className="items-center mb-5">
                {avatarUri?(
                    <Image source = {{uri : avatarUri}} className="w-24 h-24 rounded-full"/>
                ):(
                    <View className="w-24 h-24 rounded-full bg-slate-800 items-center justify-center">
                        <Text className="text-white text-xs text-center">Tap to add a photo</Text>
                    </View>
                )}
            </TouchableOpacity>
            <Text className="p-1 text-center">Enter your new username</Text>

            <TextInput
                value = {username} onChangeText={setUserName}
                autoCapitalize="none"
                placeholder="username" placeholderTextColor="#94a3b8"
                className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"    
            />
            <Text className="p-1 text-center">Enter your new name</Text>
            <TextInput
                value = {name} onChangeText={setName}
                autoCapitalize="none"
                placeholder="name" placeholderTextColor="#94a3b8"
                className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"    
            /> 
            <TouchableOpacity
            onPress={handleProfile}
            disabled={loading||uploading}
            className="bg-slate-800 rounded-xl px-4 py-3 mt-2">
            <Text className="text-white">{loading||uploading ? "Saving..." : "Save Profile"}</Text>
            </TouchableOpacity>           
        </View>
    </SafeAreaView>
    )
}