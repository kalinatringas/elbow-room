import { Tabs, usePathname } from 'expo-router';
import FloatingNav from '@/components/FloatingNav';
import { View } from 'react-native';

export default function TabLayout() {
  const pathname = usePathname();

  // map route → tab name
  const activeTab = pathname.includes('profile') ? 'profile'
    : pathname.includes('post') ? 'post'
    : 'home';

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="post" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <FloatingNav active={activeTab} /> {/* ✅ renders over all screens */}
    </View>
  );
}