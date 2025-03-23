import { StyleSheet } from 'react-native';
import { Slot, Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen name="contact-management/addcontact" options={{ title: "Add Contact" }} />
      <Stack.Screen name="contact-management/UpdateContact" options={{ title: "Update contact" }} />
      <Stack.Screen name="contact-management/Allcontact" options={{ title: "All Contacts" }} />
      {/* <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
      <Stack.Screen name="recent" options={{ title: "Recent" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="help" options={{ title: "Help & Feedback" }} /> */}

      <Stack.Screen name="contact-management/addcontact" options={{ title: "Add Contact", headerShown: false }} />

      {/* <Stack.Screen name="contact-management/updatecontact" options={{ title: "Update Contact" }} /> */}
    </Stack>
  );
}