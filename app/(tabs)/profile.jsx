import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(FIREBASE_DB, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log('No user data found.');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load profile. Please try again later.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>My Profile</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{userData.fullName}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Contact Number</Text>
          <Text style={styles.value}>{userData.contactNumber}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Account Created</Text>
          <Text style={styles.value}>
            {new Date(userData.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Add more fields like profilePhotoUrl or bio if needed */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#444',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  infoBox: {
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#888',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    color: '#f00',
  },
});
