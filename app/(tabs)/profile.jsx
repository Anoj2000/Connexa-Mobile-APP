import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Platform
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Import Firebase app if not already imported elsewhere
import { FIREBASE_APP } from '../../firebaseConfig';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const auth = getAuth();
  // Initialize storage with the Firebase app instance
  const storage = getStorage(FIREBASE_APP);

  useEffect(() => {
    // Check Firebase Storage connectivity
    const checkFirebaseStorage = async () => {
      try {
        console.log('Checking Firebase Storage connectivity...');
        // Try to list items to check connectivity
        const testRef = ref(storage, 'test');
        console.log('Firebase Storage initialized successfully');
      } catch (error) {
        console.error('Firebase Storage initialization error:', error);
      }
    };
    
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          console.log('Current user:', user.uid);
          const docRef = doc(FIREBASE_DB, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
            console.log('User data loaded successfully');
          } else {
            console.log('No user data found.');
          }
        } else {
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFirebaseStorage();
    fetchUserData();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 
          'Sorry, we need camera roll permissions to upload photos.');
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Add this to get base64 data
      });

      console.log('Image picker result:', 
        result.canceled ? 'Canceled' : `Selected image of type: ${result.assets?.[0]?.type || 'unknown'}`);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Check if we have a valid URI and base64 data
        if (!selectedAsset.uri) {
          Alert.alert('Error', 'Selected image URI is invalid');
          return;
        }
        
        await uploadImage(selectedAsset);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const uploadImage = async (imageAsset) => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to upload a profile picture.');
      return;
    }
    
    setUploading(true);
    
    try {
      console.log('Starting image upload process...');
      
      // Generate a unique filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `${auth.currentUser.uid}_${timestamp}.jpg`;
      console.log('Uploading to path:', `profilePictures/${filename}`);
      
      // Method 1: Using XMLHttpRequest to upload directly to Firebase
      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the upload
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        xhr.onerror = () => {
          reject(new Error('XHR Network error occurred'));
        };
      });
      
      // Get the blob data directly from the asset
      const blobPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function() {
          reject(new Error('Failed to convert image to blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', imageAsset.uri, true);
        xhr.send(null);
      });
      
      const blob = await blobPromise;
      console.log('Blob created successfully:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Invalid image: File size is 0 bytes');
      }
      
      // Method 2: Alternative approach using Firebase SDK directly
      const fileRef = ref(storage, `profilePictures/${filename}`);
      const metadata = {
        contentType: 'image/jpeg',
      };
      
      console.log('Starting upload to Firebase Storage...');
      const uploadResult = await uploadBytes(fileRef, blob, metadata);
      console.log('Upload completed successfully:', uploadResult);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);
      console.log('Download URL:', downloadURL);
      
      // Update user document with photo URL
      const userRef = doc(FIREBASE_DB, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        profilePhoto: downloadURL
      });
      console.log('Firestore document updated');
      
      // Update local state
      setUserData(prevData => ({
        ...prevData,
        profilePhoto: downloadURL
      }));
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      // More detailed error message
      Alert.alert(
        'Upload Failed', 
        `There was a problem uploading your image: ${error.message || 'Unknown error'}`
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>Unable to load profile. Please try again later.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={pickImage}
            disabled={uploading}>
            {userData.profilePhoto ? (
              <Image 
                source={{ uri: userData.profilePhoto }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.initialsText}>
                  {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            ) : (
              <View style={styles.cameraIconContainer}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userData.fullName}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <InfoItem 
              icon="user" 
              label="Full Name" 
              value={userData.fullName} 
            />
            
            <InfoItem 
              icon="mail" 
              label="Email" 
              value={userData.email} 
            />
            
            <InfoItem 
              icon="phone" 
              label="Contact Number" 
              value={userData.contactNumber || 'Not provided'} 
            />
            
            <InfoItem 
              icon="calendar" 
              label="Account Created" 
              value={new Date(userData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} 
            />
            
            {userData.location && (
              <InfoItem 
                icon="map-pin" 
                label="Location" 
                value={userData.location} 
              />
            )}
            
            {userData.bio && (
              <InfoItem 
                icon="info" 
                label="Bio" 
                value={userData.bio} 
                multiline
              />
            )}
          </View>
          
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component to display each info item
const InfoItem = ({ icon, label, value, multiline = false }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconContainer}>
      {/* This would use an actual icon library in production */}
      <Text style={styles.infoIcon}>{icon[0].toUpperCase()}</Text>
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[
        styles.infoValue, 
        multiline && { marginTop: 4 }
      ]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFF',
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    position: 'relative',
  },
  profileInitials: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 18,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    paddingLeft: 5,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoIcon: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIconText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#FFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});