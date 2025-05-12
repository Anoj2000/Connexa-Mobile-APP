import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
        navigateToHome();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const navigateToHome = () => {
    try {
      router.push('/');
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const handleLogin = async () => {
    setError('');

    // Input validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      setError('Email must be a @gmail.com address');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      try {
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userToStore = {
            uid: user.uid,
            email: user.email,
            phoneNumber: userData.phoneNumber,
            displayName: userData.displayName || user.displayName
          };

          await AsyncStorage.setItem('currentUser', JSON.stringify(userToStore));
        } else {
          await AsyncStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email
          }));
        }
      } catch (firestoreError) {
        console.error("Error fetching user data:", firestoreError);
      }

      setLoading(false);
      setShowSuccessPopup(true);
    } catch (err) {
      setLoading(false);
      setError(getUserFriendlyError(err.code));
    }
  };

  const getUserFriendlyError = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'Account disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password for this email';
      default:
        return 'Login failed. Please try again';
    }
  };

  const handleSignUpRedirect = () => {
    try {
      router.push('/Auth/SignUp');
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Enter your credentials to continue</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>LOG IN</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignUpRedirect}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={showSuccessPopup}
        animationType="fade"
      >
        <View style={styles.modalBackground}>
          <View style={styles.successPopup}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Login successful!</Text>
            <Text style={styles.redirectText}>Redirecting to home page...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#2196F3',
    marginTop: 10,
    fontSize: 15,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successPopup: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '80%',
  },
  successIcon: {
    fontSize: 60,
    color: '#4CAF50',
    marginBottom: 15,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  redirectText: {
    color: '#666',
    fontSize: 16,
  }
});
