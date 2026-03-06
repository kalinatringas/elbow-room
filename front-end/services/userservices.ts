import { supabase } from "@/lib/supabaseClient";

// base URL for your backend API; configure via env or fallback to localhost
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const createUser = async (profileData: {
    name: string,
    username: string,
    bio?: string,
}) => {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
        throw new Error("not authenticated");
    }

    const res = await fetch(`${API_BASE}/user/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(profileData),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
    }

    return res.json();
};