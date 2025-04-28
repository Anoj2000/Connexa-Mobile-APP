import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Create a context for the current user
export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Combine auth user with additional data from Firestore
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              phoneNumber: userDoc.data().phoneNumber,
              // Add other user details as needed
            });
          } else {
            // If we don't have additional data, just use the auth user
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              // The phone number might be null here if not in auth data
            });
          }
        } catch (error) {
          console.error("Error getting user data:", error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
          });
        }
        setLoading(false);
      } else {
        // User is not logged in, redirect to login
        setCurrentUser(null);
        router.replace('/Auth/Login');
        setLoading(false);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the context
export function useUser() {
  return useContext(UserContext);
}

// This component can be used as a wrapper for protected routes
export default function AuthCheck({ children }) {
  const { currentUser, loading } = useUser();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return null; // Redirect is happening, no need to render anything
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});