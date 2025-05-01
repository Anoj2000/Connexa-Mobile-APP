import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_APP, FIREBASE_DB } from '../../firebaseConfig';

const ProfileImageUploader = ({ userData, setUserData }) => {
  const [uploading, setUploading] = useState(false);
  const auth = getAuth();
  const storage = getStorage(FIREBASE_APP);

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

  const pickAndUploadImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setUploading(true);
      
      // Resize and compress the image to ensure it's not too large
      const manipResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      
      console.log("Image manipulated successfully");
      
      // Convert to blob using XMLHttpRequest
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function(e) {
          console.log(e);
          reject(new Error('Failed to convert image to blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', manipResult.uri, true);
        xhr.send(null);
      });
      
      console.log("Blob created:", blob.size, "bytes");
      
      if (!blob || blob.size === 0) {
        throw new Error("Failed to create valid blob from image");
      }

      // Create a unique filename
      const filename = `profile_${auth.currentUser.uid}_${Date.now()}.jpg`;
      const imageRef = ref(storage, `profilePictures/${filename}`);
      
      // Upload the blob with metadata
      const metadata = {
        contentType: 'image/jpeg',
      };
      
      await uploadBytes(imageRef, blob, metadata);
      console.log("Upload successful");
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      console.log("Download URL:", downloadURL);
      
      // Update Firestore
      if (auth.currentUser) {
        const userRef = doc(FIREBASE_DB, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          profilePhoto: downloadURL
        });
        
        // Update local state
        setUserData(prevData => ({
          ...prevData,
          profilePhoto: downloadURL
        }));
        
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error in image upload:", error);
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.profileImageContainer}
      onPress={pickAndUploadImage}
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
  );
};

const styles = StyleSheet.create({
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
});

export default ProfileImageUploader;