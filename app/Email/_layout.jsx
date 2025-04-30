import React from 'react'
import { Slot, Stack } from 'expo-router';

export default function _layout() {
   return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="Email/Email" 
          options={{ 
            title: "Email",
            presentation: "modal",
            animation: "slide_from_bottom"
          }} 
        />
      </Stack>
    );
}