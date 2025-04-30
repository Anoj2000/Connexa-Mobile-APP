import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';

export default function Sidebar() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { icon: '☎️', title: 'All Contacts', screen: 'contact-management/Allcontact' },
    { icon: '🔄', title: 'Contact Interaction', screen: 'interaction-tracking-system/readLog' },
    { icon: '👥', title: 'Share & collabarotion', screen: 'Sharing&Collaboration/groups' },
    { icon: '⭐', title: 'FollowUp Reminder', screen: 'FollowUp_Reminder/FollowUp_Page' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        try {
          const docRef = doc(FIREBASE_DB, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserInfo({
              fullName: userData.fullName || 'No Name Provided',
              email: user.email || userData.email || 'No Email Provided',
            });
          } else {
            console.log('No user data found in Firestore');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleNavigation = (screen) => {
    router.push(`/${screen}`);
  };

  const navigateToProfile = () => {
    router.push('/profile'); // Make sure you have a profile screen
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2979FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <TouchableOpacity style={styles.header} onPress={navigateToProfile}>
        <View style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userInfo?.fullName || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{userInfo?.email || 'No email available'}</Text>
        </View>
      </TouchableOpacity>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => handleNavigation(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingBottom: 70 },
  header: {
    padding: 20, backgroundColor: '#2979FF',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 15, paddingBottom: 30,
  },
  userAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#ffffff', marginRight: 15,
  },
  userInfo: { flex: 1 },
  userName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  userEmail: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 3 },
  menuContainer: { flex: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 20,
    borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0',
  },
  menuIcon: { fontSize: 22, marginRight: 15, width: 26, textAlign: 'center' },
  menuTitle: { fontSize: 16, color: '#333' },
  footer: {
    padding: 20, borderTopWidth: 0.5, borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#f0f0f0', padding: 15, borderRadius: 5, alignItems: 'center',
  },
  logoutText: { color: '#2979FF', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
