import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Create a context for the current user
export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              phoneNumber: userDoc.data().phoneNumber,
            });
          } else {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
            });
          }

          // Redirect to home if currently on login or signup
          if (pathname.startsWith('/Auth')) {
            router.replace('/');
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
        setCurrentUser(null);
        setLoading(false);

        // Redirect to login if trying to access a protected screen
        if (!pathname.startsWith('/Auth')) {
          router.replace('/Auth/Login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname]);

  return (
    <UserContext.Provider value={{ currentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

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

  if (!currentUser) return null;

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
