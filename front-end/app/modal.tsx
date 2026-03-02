import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { verifyInstallation } from 'nativewind';
import { View, Text } from 'react-native';
export default function ModalScreen() {
  verifyInstallation(); 

  return (
   <View>
    <Text>Hello</Text>
   </View>
  );
}
