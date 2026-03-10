import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const tabs = [
  { name: "home", icon: "home", label: "Home", route: "/home" as Href },
  { name: "feed", icon: "add", label: "Explore", route: "/feed" as Href },
  { name: "profile", icon: "person", label: "Profile", route: "/profile" as Href },
];

function NavButton({ tab, active, onPress }: { tab: typeof tabs[0], active: boolean, onPress: () => void }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: active ? -30 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [active]);

  return (
    <TouchableOpacity onPress={onPress} className="items-center gap-1">
      <Animated.View style={{ transform: [{ translateY }] }} className="items-center gap-1">
        <View className={`p-3 rounded-full ${active ? "bg-indigo-100" : "bg-white"}`}>
        <Ionicons
          name={tab.icon as any}
          size={32}
          color={active ? "#6366f1" : "#9ca3af"}
        />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}


export default function FloatingNav({active}: { active:string}){

    return (
    <View className="absolute bottom-8 left-6 right-6 bg-indigo-100 rounded-2xl p-2 justify-around flex-row">
       {tabs.map((tab)=>(
        <NavButton
        key={tab.name}
        tab={tab}
        active = {active === tab.name}
        onPress={()=> router.replace(tab.route)}
        />
    ))}
    </View>
    )

}