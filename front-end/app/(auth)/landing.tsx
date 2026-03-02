import { useState } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Text, Modal, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabaseClient";
import { router } from "expo-router";


export default function Landing() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Login error", error.message);
    else router.replace("/(tabs)");
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) { Alert.alert("Error", "Passwords do not match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert("Sign up error", error.message);
    else Alert.alert("Success", "Check your email!", [{ text: "OK", onPress: () => setActiveSheet(null) }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-indigo-300 items-center justify-center">

      <View className="absolute bottom-10 w-full px-6 gap-3">
        <TouchableOpacity
          onPress={() => setActiveSheet("Login")}
          className="bg-zinc-200 rounded-xl p-4 items-center">
          <Text className="text-lg">Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSheet("SignUp")}
          className="bg-indigo-500 rounded-xl p-4 items-center">
          <Text className="text-lg text-white">Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={activeSheet !== null} transparent animationType="slide" onRequestClose={() => setActiveSheet(null)}>
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setActiveSheet(null)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className=""
            >
        <View className="bg-white rounded-t-3xl p-6">

          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
            {["Login", "SignUp"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveSheet(tab)}
                className={`flex-1 py-2 rounded-lg items-center ${activeSheet === tab ? "bg-white" : ""}`}>
                <Text className={activeSheet === tab ? "text-indigo-500 font-semibold" : "text-gray-500"}>
                  {tab === "Login" ? "Log In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-700 text-sm mb-1">Email</Text>
          <TextInput
            value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address"
            placeholder="you@example.com" placeholderTextColor="#94a3b8"
            className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
          />

          <Text className="text-slate-700 text-sm mb-1">Password</Text>
          <TextInput
            value={password} onChangeText={setPassword}
            secureTextEntry autoCapitalize="none"
            placeholder="••••••••" placeholderTextColor="#94a3b8"
            className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
          />

          {activeSheet === "SignUp" && (
            <>
              <Text className="text-slate-700 text-sm mb-1">Confirm Password</Text>
              <TextInput
                value={confirmPassword} onChangeText={setConfirmPassword}
                secureTextEntry autoCapitalize="none"
                placeholder="••••••••" placeholderTextColor="#94a3b8"
                className="bg-slate-800 text-white rounded-xl px-4 py-3 mb-3"
              />
            </>
          )}

          <TouchableOpacity
            onPress={activeSheet === "Login" ? handleLogin : handleSignup}
            disabled={loading}
            className={`rounded-xl p-4 items-center mt-2 ${loading ? "bg-indigo-300" : "bg-indigo-500"}`}>
            <Text className="text-white font-semibold">
              {loading ? "Loading..." : activeSheet === "Login" ? "Sign In" : "Sign Up"}
            </Text>  

          </TouchableOpacity>
        
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}