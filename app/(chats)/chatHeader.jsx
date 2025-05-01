import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

const ChatHeader = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userDocRef = doc(FIREBASE_DB, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            console.log('No user data found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation should be handled by your authentication context or navigator
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity onPress={handleLogout}>
          {loading ? (
            <View style={styles.profileImagePlaceholder}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          ) : (
            userData?.profilePhoto ? (
              <Image 
                source={{ uri: userData.profilePhoto }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.initialsText}>
                  {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20, 
    paddingBottom: 2,
    backgroundColor: '#4A90E2', // Changed to match profile blue color
  },
  headerTitle: {
    fontSize: 30,
    paddingBottom: 20,
    paddingTop: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initialsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  }
});