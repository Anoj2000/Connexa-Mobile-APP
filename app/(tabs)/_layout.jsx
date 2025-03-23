import React from 'react';
import { Text } from 'react-native'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../home';
import Chat from './chat';
import Notification from './notification';
import Profile from './profile';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MyTabs = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <MyTabs.Navigator
      screenOptions={{
        headerShown: false, 
      }}
    >
      <MyTabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginBottom: 3 }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ color, size }) => ( 
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <MyTabs.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginBottom: 3 }}>
              Chat
            </Text>
          ),
          tabBarIcon: ({ color, size }) => ( 
            <AntDesign name="wechat" size={size} color={color} />
          ),
        }}
      />

      <MyTabs.Screen
        name="Notifications"
        component={Notification}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginBottom: 3 }}>
              Notifications
            </Text>
          ),
          tabBarIcon: ({ color, size }) => ( 
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <MyTabs.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12, marginBottom: 3 }}>
              Profile
            </Text>
          ),
          tabBarIcon: ({ color, size }) => ( 
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </MyTabs.Navigator>
  );
};

export default TabNavigation;
