import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View
    className='bg-pink-500'>
      <Text>ayo</Text></View>
  );
}
