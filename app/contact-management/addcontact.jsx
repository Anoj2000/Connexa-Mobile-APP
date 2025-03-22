import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ImageBackground, Modal, FlatList,Alert,Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

const AddContact = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('Select contact type');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  
  // Form validation errors
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });

  const contactTypes = ['Friends', 'Family', 'Office', 'Relations'];
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleImagePick = () => {
    console.log('Image picker would open here');
    // Implement image picker functionality here
  };

  // Reset all form errors
  const resetErrors = () => {
    setErrors({
      name: '',
      email: '',
      phone: '',
      note: ''
    });
  };

  // Convert name to proper case (first letter capital, rest lowercase)
  const toProperCase = (value) => {
    if (!value) return '';
    
    // Split the full name by spaces to handle multiple words
    const nameWords = value.trim().split(' ');
    
    // Capitalize the first letter of each word, lowercase the rest
    const properCaseName = nameWords.map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    
    return properCaseName;
  };

  // Validate individual fields
  const validateName = (value) => {
    if (!value.trim()) {
      setErrors(prev => ({...prev, name: 'Name is required'}));
      return false;
    } else if (value.trim().length < 2) {
      setErrors(prev => ({...prev, name: 'Name must be at least 2 characters'}));
      return false;
    } 
    
    // Check if the name is in proper case format
    const properCaseName = toProperCase(value);
    if (value !== properCaseName) {
      setErrors(prev => ({...prev, name: 'Name should start with capital letter (e.g., Yasiru)'}));
      return false;
    } else {
      setErrors(prev => ({...prev, name: ''}));
      return true;
    }
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      // Email is optional, so empty is okay
      setErrors(prev => ({...prev, email: ''}));
      return true;
    }
  
    // Regular expression for Gmail validation specifically
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    if (!gmailRegex.test(value)) {
      setErrors(prev => ({...prev, email: 'Please enter a valid Gmail address (@gmail.com)'}));
      return false;
    } else {
      setErrors(prev => ({...prev, email: ''}));
      return true;
    }
  };

  const validatePhone = (value) => {
    if (!value.trim()) {
      setErrors(prev => ({...prev, phone: 'Phone number is required'}));
      return false;
    }
  
    // Clean the phone number by removing non-digit characters
    const cleanPhoneNumber = value.replace(/[^0-9]/g, '');
    
    // Check if it's exactly 10 digits and starts with 0
    if (cleanPhoneNumber.length !== 10) {
      setErrors(prev => ({...prev, phone: 'Phone number must be exactly 10 digits'}));
      return false;
    } else if (!cleanPhoneNumber.startsWith('0')) {
      setErrors(prev => ({...prev, phone: 'Phone number must start with 0'}));
      return false;
    } else {
      setErrors(prev => ({...prev, phone: ''}));
      return true;
    }
  };

  const validateNote = (value) => {
    if (value.trim().length > 20) {
      setErrors(prev => ({...prev, note: 'Note cannot exceed 20 characters'}));
      return false;
    } else {
      setErrors(prev => ({...prev, note: ''}));
      return true;
    }
  };
  

  // Run validation on field changes
  const handleNameChange = (value) => {
    setName(value);
    validateName(value);
  };

  // Auto-format name to proper case on blur
  const handleNameBlur = () => {
    const properName = toProperCase(name);
    setName(properName);
    validateName(properName);
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    validateEmail(value);
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    validatePhone(value);
  };

  const handleNoteChange = (value) => {
    setNote(value);
    validateNote(value);
  };

  // Full form validation
  const validateForm = () => {
    resetErrors();
    
    const nameValid = validateName(name);
    const emailValid = validateEmail(email);
    const phoneValid = validatePhone(phone);
    const noteValid = validateNote(note);
    
    return nameValid && emailValid && phoneValid && noteValid;
  };

  const handleAddContact = async () => {
    // Format name to proper case before saving
    const properName = toProperCase(name);
    setName(properName);
    
    // Validate form first
    if (!validateForm()) {
      // Show error message for the first field with an error
      for (const field of ['name', 'phone', 'email', 'note']) {
        if (errors[field]) {
          Alert.alert("Validation Error", errors[field]);
          return;
        }
      }
      return;
    }

    Alert.alert(
      "Add Contact", 
      "Are you sure you want to add this contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // Add document to Firestore
              await addDoc(collection(FIREBASE_DB, "contacts"), {
                name: properName, // Use the properly formatted name
                email: email,
                phone: phone,
                note: note,
                type: selectedType === 'Select contact type' ? 'Other' : selectedType,
                profileImage: profileImage,
                createdAt: Timestamp.now(),
              });
              
              // Show success message
              Alert.alert("Success", "Contact added successfully", [
                {
                  text: "OK",
                  onPress: () => router.back()
                }
              ]);
            } catch (error) {
              console.error("Error adding contact: ", error);
              Alert.alert("Error", "Something went wrong. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/addcontactback.webp')} 
      style={styles.backgroundImage}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
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

        <Text style={styles.label}>Name <Text style={styles.requiredStar}>*</Text></Text>
        <TextInput 
          style={[styles.input, errors.name ? styles.inputError : null]} 
          placeholder="Enter contact name " 
          value={name}
          onChangeText={handleNameChange}
          onBlur={handleNameBlur}
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : (
          <Text style={styles.infoText}>First letter capital, rest lowercase (e.g., Yasiru)</Text>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={[styles.input, errors.email ? styles.inputError : null]} 
          placeholder="Enter email address" 
          keyboardType="email-address" 
          value={email}
          onChangeText={handleEmailChange}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <Text style={styles.label}>Phone <Text style={styles.requiredStar}>*</Text></Text>
        <TextInput 
          style={[styles.input, errors.phone ? styles.inputError : null]} 
          placeholder="Enter phone number" 
          keyboardType="phone-pad" 
          value={phone}
          onChangeText={handlePhoneChange}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        <Text style={styles.label}>Note</Text>
        <TextInput 
          style={[
            styles.input, 
            styles.multilineInput,
            errors.note ? styles.inputError : null
          ]} 
          placeholder="Add a note about this contact" 
          multiline 
          value={note}
          onChangeText={handleNoteChange}
        />
        {errors.note ? <Text style={styles.errorText}>{errors.note}</Text> : null}
        {note ? <Text style={styles.characterCount}>{note.length}/500</Text> : null}

        <Text style={styles.label}>Type</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
          <Text style={styles.dropdownText}>{selectedType}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal for selecting contact type */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Contact Type</Text>
            <FlatList 
              data={contactTypes} 
              keyExtractor={(item) => item} 
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => {
                    setSelectedType(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )} 
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.80)', paddingTop: 50 },
  backButton: { marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  profileImageContainer: { position: 'relative', marginTop: 10 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  placeholderImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ddd' 
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
    borderColor: '#fff' 
  },
  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5 
  },
  requiredStar: {
    color: 'red',
    fontSize: 16
  },
  input: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#AFC6FF', 
    borderRadius: 8, 
    marginBottom: 5, 
    paddingLeft: 10, 
    fontSize: 16, 
    backgroundColor: '#ffffff' 
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5
  },
  characterCount: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    marginBottom: 10
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10
  },
  dropdown: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#AFC6FF', 
    borderRadius: 8, 
    justifyContent: 'center', 
    paddingLeft: 10, 
    marginBottom: 20, 
    backgroundColor: '#f9f9f9' 
  },
  dropdownText: { fontSize: 16, color: '#777' },
  addButton: { 
    backgroundColor: '#007AFF', 
    paddingVertical: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', width: 300, padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  modalText: { fontSize: 18, color: '#333' },
  modalClose: { marginTop: 10, alignItems: 'center', paddingVertical: 10 },
  modalCloseText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' }
});

export default AddContact;