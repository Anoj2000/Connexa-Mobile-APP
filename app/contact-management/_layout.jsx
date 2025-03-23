import { StyleSheet } from 'react-native';
import { Slot, Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="contact-management/addcontact" options={{ title: "Add Contact", headerShown: false }} />
      {/* <Stack.Screen name="contact-management/updatecontact" options={{ title: "Update Contact" }} /> */}
    </Stack>
  );
}