import { StyleSheet, Text, View } from 'react-native'
import { Slot, Stack} from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Create_FollowUp" />
      <Stack.Screen name="Edit_FollowUp" />
      <Stack.Screen name="Delete_FollowUp" />
      <Stack.Screen name="FollowUp_Dashboard" />
    </Stack>

  );
}