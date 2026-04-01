import { supabase } from "./supabaseClient";
import { Alert } from "react-native";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;


async function authFetch(path:string, options: RequestInit = {}){
    const{data:{session}}= await supabase.auth.getSession();
    const response = await fetch(`${BASE_URL}${path}`,{
        ...options,
        headers:{
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
      }); 
    if (!response.ok){
        const err = await response.json();
        throw new Error(typeof err.detail === "string" ? err.detail: JSON.stringify(err.detail));
      }
    return response.json();
}

export const getPosts = (cursor? : string)=>{
    authFetch(`/posts/${cursor ? `?cursor=${cursor}`:""}`)
}

export const getMyPosts = (cursor?:string)=>{
    authFetch(`/posts/me/${cursor ? `?cursor=${cursor}`:""}`)
}

export const toggleLike = (postID:string)=>{
    authFetch(`posts/${postID}/like`, {method: "POST"})
}

export const getUser = (userId: string) =>
  authFetch(`/user/${userId}`);

export const updateUser = (formData: FormData) =>
  authFetch("/users/me", { method: "PATCH", body: formData, headers: {} });

type PostItem = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
};

// export const onLike = async (postID:string, setPosts: PostItem )=>{
//     // fetch current like count, increase 
//     try{
//       const{data:{session}}= await supabase.auth.getSession();
//       const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/${postID}/like`,{
//         method: "POST",
//         headers:{
//           Authorization: `Bearer ${session?.access_token}`
//         },
//       }); 
//         if (!response.ok){
//             throw new Error("Failed to toggle like");
//         }
//       const {liked, like_count} = await response.json();
//       setPosts(prev=>
//         prev.map(p=>
//           p.id === postID
//           ?{...p, liked_by_me:liked, like_count:like_count}
//           : p
//         )
//       );
//     }catch(error){
//       Alert.alert("Error", (error as Error).message);
//     }
//   }