import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  Animated,
} from 'react-native';
import { Link } from 'expo-router';
import "../../firebaseConfig"; 

const { width } = Dimensions.get('window');

export default function FollowUp_Page() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarX = useState(new Animated.Value(-width))[0];

  const toggleSidebar = () => {
    Animated.timing(sidebarX, {
      toValue: sidebarVisible ? -width : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://static.vecteezy.com/system/resources/thumbnails/036/404/520/small_2x/customer-relationship-management-crm-businessman-or-client-show-global-structure-customer-network-technology-data-exchanges-development-customer-service-digital-marketing-online-social-media-hr-photo.JPG',
      }}
      style={styles.background}
      blurRadius={1}
    >
      <View style={styles.overlay}>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>🚀 FollowUPs Reminders</Text>

          <Link href="/FollowUp_Reminder/Create_FollowUp" style={styles.link}>
            ➕ Create Follow-Up
          </Link>

          <Link href="/FollowUp_Reminder/Edit_FollowUp" style={styles.link}>
            ✏️ Edit Follow-Up
          </Link>

          <Link href="/FollowUp_Reminder/AllRemindersForDelete" style={styles.link}>
            🗑️ Delete Follow-Up
          </Link>

          <Link href="/FollowUp_Reminder/Reminder_Summery" style={styles.dashboardBtn}>
            📋 Follow-Up Dashboard
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  link: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  dashboardBtn: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    overflow: 'hidden',
  },
  menuIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#fff',
    zIndex: 9,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
