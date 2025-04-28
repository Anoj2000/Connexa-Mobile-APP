import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="interaction-tracking-system/addLog" options={{ title: "Add New Log" }} />
      <Stack.Screen name="interaction-tracking-system/updateLog" options={{ title: "Update Logs" }} />
      <Stack.Screen name="contact-interaction-tracking-system/readLog" options={{ title: "Read Logs" }} />
    </Stack>
  );
}