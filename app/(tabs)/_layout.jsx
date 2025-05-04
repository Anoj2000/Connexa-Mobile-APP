import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import HomeTabScreen from '../home';
import ChatScreen from './chat';
import NotificationScreen from './notification';
import ProfileScreen from './profile';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      initialRouteName="index"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'index':
              return (
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={size}
                  color={color}
                />
              );
            case 'chat':
              return (
                <FontAwesome5
                  name={focused ? 'comments' : 'comments'}
                  size={size}
                  color={color}
                />
              );
            case 'notification':
              return (
                <Ionicons
                  name={focused ? 'notifications' : 'notifications-outline'}
                  size={size}
                  color={color}
                />
              );
            case 'profile':
              return (
                <MaterialCommunityIcons
                  name={focused ? 'account' : 'account-outline'}
                  size={size}
                  color={color}
                />
              );
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="index" component={HomeTabScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Tab.Screen name="notification" component={NotificationScreen} options={{ title: 'Notification' }} />
      <Tab.Screen name="profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
