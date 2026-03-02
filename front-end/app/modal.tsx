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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
