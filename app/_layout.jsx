import { Stack } from 'expo-router';
import { UserProvider } from './Auth/AuthCheck'; // adjust path if needed

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(chats)" options={{ headerShown: false }} />
        <Stack.Screen name="Auth/Login" options={{ headerShown: false }} />
        <Stack.Screen name="Auth/Signup" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}