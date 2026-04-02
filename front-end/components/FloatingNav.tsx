import { View, TouchableOpacity, Animated, Image } from "react-native";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { Href } from "expo-router";
import { StyleSheet } from "react-native";


const tabs = [
  { name: "home", label: "Home", route: "/home" as Href, icon: require('../assets/Home.png') },
  { name: "post", label: "Explore", route: "/post" as Href, icon: require('../assets/Post.png') },
  { name: "profile", label: "Profile", route: "/profile" as Href, icon: require('../assets/Profile.png') },
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
        <View className={`p-3 rounded-full`}>
          <Image source={tab.icon} style={{ width: 42, height: 42 }} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}


export default function FloatingNav({active}: { active:string}){

    return (
    <View className="absolute bottom-0 right-0 left-0 rounded-t-2xl justify-around flex-row" style={{ height: 80 }} >
      <View style={[StyleSheet.absoluteFillObject, styles.background, {height:110}]}>
        <Image
          source={require('../assets/Navbar.png')}
          style={{ position: 'absolute', top: 0, bottom: 0}}
          resizeMode="stretch"
        />
      </View>
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

const styles = StyleSheet.create({
  background: {
    overflow: "hidden", 
    borderRadius:16,
  
  },
});