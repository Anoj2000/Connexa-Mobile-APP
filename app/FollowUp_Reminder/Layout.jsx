import { StyleSheet, Text, View } from 'react-native'
import { Slot, Stack} from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="FollowUp_Reminder/Create_FollowUp" />
      <Stack.Screen name="FollowUp_Reminder/Edit_FollowUp" />
      <Stack.Screen name="FollowUp_Reminder/Delete_FollowUp" />
      <Stack.Screen name="FollowUp_Reminder/FollowUp_Dashboard" />
    </Stack>
  );
}