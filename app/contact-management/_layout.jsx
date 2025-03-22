import { StyleSheet, Text, View } from 'react-native'
import { Slot, Stack} from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="addcontact" />
      <Stack.Screen name="updatecontact" />
    </Stack>
  );
}
