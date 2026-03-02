import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { View,Text } from 'react-native';

export default function HomeScreen() {
  return (
   <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-purple-500">
        Welcome to PURPLE!
      </Text>
    </View>
  );
}

