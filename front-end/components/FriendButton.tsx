import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, Text } from "react-native";

type Status =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "friends"
  | "loading"
  | "unknown"; 

export default function FriendButton({userId}: {userId:string}){
    const [status, setStatus] = useState<Status>("loading")

    useEffect(()=>{
        fetchStatus();
    }, [userId])

    const fetchStatus = async () =>{
        try{
            const {data:{session}} = await supabase.auth.getSession();
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/status/${userId}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) {
                console.log("Status fetch failed:", res.status);
                setStatus("none");
                return;
            }
            const json = await res.json();
            console.log("STATUS RESPONSE:", json);

            setStatus(json.status ?? "none");
        } catch (err) {
            console.log("Error fetching status:", err);
            setStatus("none");
        }
    };
    const sendRequest = async()=>{
        setStatus("loading");
        const{data:{session}}  = await supabase.auth.getSession();
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/request/${userId}`,{
            method: "POST",
            headers: {Authorization: `Bearer ${session?.access_token}`},
        });
        const newStatus = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/status/${userId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        }).then(res => res.json());

        setStatus(newStatus.status);
    }
    const acceptRequest = async()=>{
        setStatus("loading");
        const{data:{session}}  = await supabase.auth.getSession();
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/accept/${userId}`,{
            method: "POST",
            headers: {Authorization: `Bearer ${session?.access_token}`},
        });
        setStatus("friends");
    }
    const removeFriend = async()=>{
        setStatus("loading");
        const{data:{session}}  = await supabase.auth.getSession();
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/friends/${userId}`,{
            method: "DELETE",
            headers: {Authorization: `Bearer ${session?.access_token}`},
        });
        setStatus("none");
    }
    if (status ==="loading") return <ActivityIndicator/>
    const configs = {
        none: { label: "Add friend", style: "bg-indigo-500", onPress: sendRequest },
        pending_sent: { label: "Request sent", style: "bg-gray-300", onPress: removeFriend },
        pending_received: { label: "Accept request", style: "bg-green-500", onPress: acceptRequest },
        friends: { label: "Friends", style: "bg-indigo-300", onPress: removeFriend },

        unknown: { label: "Unavailable", style: "bg-gray-400", onPress: async () => {} }
    };
    const {label, style, onPress} = configs[status as keyof typeof configs];
    return(
        <TouchableOpacity
            onPress={onPress}
            className={`${style} rounded-xl px-4 py-2`}
            >
            <Text className="text-white text-sm font-medium">{label}</Text>
        </TouchableOpacity>
    )
}
