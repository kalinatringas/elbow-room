import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const tabs = [
  { name: "home", icon: "home", label: "Home", route: "/(tabs)/home" as Href, dx:15, dy:-15},
  { name: "post", icon: "add", label: "Post", route: "/(tabs)/explore" as Href,dx:20, dy:-20 },
  { name: "profile", icon: "person", label: "Profile", route: "/(tabs)/profile" as Href, dx:15, dy:0},
];

function NavButton({ tab, active, onPress }: { tab: typeof tabs[0], active: boolean, onPress: () => void }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  useEffect(() => { 
    Animated.spring(translateY, {
      toValue: active ? tab.dy : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    Animated.spring(translateX,{
      toValue: active? tab.dx: 0,
      useNativeDriver: true,
      tension:100,
      friction: 8
    }).start();
  }, [active]);

  return (
    <TouchableOpacity onPress={onPress} className="items-center gap-1">
      <Animated.View style={{ transform: [{ translateX }, { translateY }] }} className="items-center gap-1">
        <View className={`p-3 rounded-full ${active ? "bg-indigo-100" : "bg-white"}`}>
        <Ionicons
          name={tab.icon as any}
          size={40}
          color={active ? "#6366f1" : "#9ca3af"}
        />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}


export default function FloatingNav({active}: { active:string}){
    const tabPositions: Record<string, object> = {
      home: { right: 16, top: "20%" },
      post: { top: 1, left: "40%" },
      profile: { right: -16, top: "50%" },
    };
    return (
    <View className="absolute rounded-full  w-72 h-72 -bottom-16 overflow-visible -left-24 bg-indigo-100 p-2 justify-around items-center">
       {tabs.map((tab)=>( n   
        <View key={tab.name}  style={{ position: "absolute", ...tabPositions[tab.name] }}>
        <NavButton
        key={tab.name}
        tab={tab}
        active = {active === tab.name}
        onPress={()=> router.replace(tab.route)}
        />
        </View>
    ))}
    </View>
    )

}