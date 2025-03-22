import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this package
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const AddContact = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);

  const handleImagePick = () => {
    // This is where you'd implement image picker functionality
    // For a complete implementation, you would use a library like react-native-image-picker
    // or expo-image-picker depending on your project setup
    console.log('Image picker would open here');
    
    // Set the local image from assets
    // setProfileImage(require('../../assets/images/addcontactback.webp'));
  };

  const handleAddContact = () => {
    // Handle saving contact logic here
    console.log('Contact would be saved here');
    
    // Navigate back to the contacts screen
    router.back();
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/addcontactback.webp')} 
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        {/* Title */}
        <Text style={styles.title}>Add New Contact</Text>
        
        {/* Profile Image Section */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleImagePick} style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={profileImage} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person-outline" size={40} color="#ccc" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} placeholder="Enter contact name" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter email address" keyboardType="email-address" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} placeholder="Enter phone number" keyboardType="phone-pad" />

        <Text style={styles.label}>Note</Text>
        <TextInput style={styles.input} placeholder="Add a note about this contact" multiline />

        <Text style={styles.label}>Type</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>Select contact type</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.60)', // Semi-transparent white background
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  dropdownText: {
    fontSize: 16,
    color: '#777',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddContact;