import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';


// Import your screen components - ensure these are the correct imports
import HomeTabScreen from '../home';
import ChatScreen from './chat';
import NotificationScreen from './notification';
import ProfileScreen from './profile';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  
  return (
    <Tab.Navigator
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="index"
        component={HomeTabScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="chat"
        component={ChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign 
              name={focused ? 'chat' : 'chat-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="notification"
        component={NotificationScreen}
        options={{
          title: 'Notification',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'notifications' : 'notifications-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'account' : 'account-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}