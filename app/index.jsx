//update
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FIREBASE_AUTH } from '../firebaseConfig';
import TabNavigation from './(tabs)/_layout';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleNavigation = (route) => {
    try {
      router.push(route);
    } catch (error) {
      console.error("Navigation error:", error);
      if (typeof window !== 'undefined') {
        window.location.href = route;
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#6e3b6e" />
        <Text style={styles.loadingText}>Loading Connexa...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="auto" />
        <LinearGradient
          colors={['#f9f9f9', '#e0e0e0']}
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to Connexa</Text>
            <Text style={styles.subtitle}>Connect with your community</Text>
            
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed
              ]}
              onPress={() => handleNavigation('/Auth/Login')}
            >
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed
              ]}
              onPress={() => handleNavigation('/Auth/SignUp')}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <TabNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#6e3b6e',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6e3b6e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    backgroundColor: '#6e3b6e',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  signupButton: {
    width: '80%',
    paddingVertical: 15,
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6e3b6e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButtonText: {
    color: '#6e3b6e',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});