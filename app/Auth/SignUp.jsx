//update
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();

  // Effect to navigate to home page after success popup is displayed
  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
        navigateToHome();
      }, 2000); // Show success popup for 2 seconds before redirecting
    }
    
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const navigateToHome = () => {
    try {
      router.push('/');  // Navigate to home page
    } catch (err) {
      console.error("Navigation error:", err);
      window.location.href = '/';
    }
  };

  const handleSignUp = async () => {
    // Reset error state
    setError('');
    
    // Validate inputs
    if (!email || !password || !confirmPassword || !fullName || !contactNumber) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\d{10}$/;  // Simple 10-digit validation
    if (!phoneRegex.test(contactNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(FIREBASE_DB, "users", user.uid), {
        fullName: fullName,
        email: email,
        contactNumber: contactNumber,
        createdAt: new Date().toISOString(),
        profilePhotoUrl: null
      });
      
      // On successful signup, show success popup
      setLoading(false);
      setShowSuccessPopup(true);
    } catch (err) {
      setLoading(false);
      setError(getUserFriendlyError(err.code));
    }
  };

  // Convert Firebase error codes to user-friendly messages
  const getUserFriendlyError = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Email is already in use';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password is too weak';
      default:
        return 'Sign up failed. Please try again';
    }
  };

  const handleLoginRedirect = () => {
    // Use window.location as a fallback for router
    try {
      router.push('/Auth/Login');
    } catch (err) {
      console.error("Navigation error:", err);
      window.location.href = '/Auth/Login';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up to get started!</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        
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
          placeholder="Contact Number"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleLoginRedirect}>
          <Text style={styles.loginText}>Already a member? Log in</Text>
        </TouchableOpacity>

        {/* Success Popup Modal */}
        <Modal
          transparent={true}
          visible={showSuccessPopup}
          animationType="fade"
        >
          <View style={styles.modalBackground}>
            <View style={styles.successPopup}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>Sign up successful!</Text>
              <Text style={styles.redirectText}>Redirecting to home page...</Text>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
  signUpButton: {
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
  loginText: {
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