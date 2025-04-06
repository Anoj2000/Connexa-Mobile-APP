import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack >
      <Stack.Screen 
      name="(tabs)"
      options={{headerShown: false}}
    />

      <Stack.Screen 
      name="interaction-tracking-system"
      options={{headerShown: false}}
    />
    </Stack>
  );
}