import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  TouchableWithoutFeedback, 
  Modal, 
  FlatList, 
  Image, 
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

export default function UpdateContact() {
  const params = useLocalSearchParams();
  const contactId = params.id;
  
  // State variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [contactType, setContactType] = useState('Select contact type');
  const [profileImage, setProfileImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contactTypes, setContactTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Animation ref
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Form validation
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });

  // Fetch contact data and types/groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!contactId) {
          Alert.alert("Error", "Contact ID is missing");
          router.back();
          return;
        }
        
        // Fetch contact data
        const contactRef = doc(FIREBASE_DB, "contacts", contactId);
        const contactSnap = await getDoc(contactRef);
        
        if (contactSnap.exists()) {
          const contactData = contactSnap.data();
          setName(contactData.name || '');
          setEmail(contactData.email || '');
          setPhone(contactData.phone || '');
          setNote(contactData.note || '');
          setContactType(contactData.type || 'Select contact type');
          setProfileImage(contactData.profileImage || null);
        } else {
          Alert.alert("Error", "Contact not found");
          router.back();
          return;
        }
        
        // Fetch groups
        const groupsSnapshot = await getDocs(collection(FIREBASE_DB, "groups"));
        const fetchedGroups = groupsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setGroups(fetchedGroups);
        
        // Combine default types with groups
        const defaultTypes = [];
        setContactTypes([...defaultTypes, ...fetchedGroups.map(group => group.name)]);
        
        setIsLoading(false);
        
        // Start fade-in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Error fetching data: ", error);
        Alert.alert("Error", "Failed to load data");
        router.back();
      }
    };
    
    fetchData();
  }, [contactId]);

  // Handle image picker
  const handleImagePick = () => {
    console.log('Image picker would open here');
    // Implement image picker functionality here
  };

  // Validation functions
  const resetErrors = () => {
    setErrors({
      name: '',
      email: '',
      phone: '',
      note: ''
    });
  };

  const toProperCase = (value) => {
    if (!value) return '';
    
    const nameWords = value.trim().split(' ');
    
    const properCaseName = nameWords.map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    
    return properCaseName;
  };

  const validateName = (value) => {
    if (!value.trim()) {
      setErrors(prev => ({...prev, name: 'Name is required'}));
      return false;
    } else if (value.trim().length < 2) {
      setErrors(prev => ({...prev, name: 'Name must be at least 2 characters'}));
      return false;
    } 
    
    const properCaseName = toProperCase(value);
    if (value !== properCaseName) {
      setErrors(prev => ({...prev, name: 'Name should start with capital letter (e.g., John)'}));
      return false;
    } else {
      setErrors(prev => ({...prev, name: ''}));
      return true;
    }
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      // Email is optional
      setErrors(prev => ({...prev, email: ''}));
      return true;
    }
  
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
  
    const cleanPhoneNumber = value.replace(/[^0-9]/g, '');
    
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
    if (value.trim().length > 500) {
      setErrors(prev => ({...prev, note: 'Note cannot exceed 500 characters'}));
      return false;
    } else {
      setErrors(prev => ({...prev, note: ''}));
      return true;
    }
  };

  // Handle input changes
  const handleNameChange = (value) => {
    setName(value);
    validateName(value);
  };

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

  // Validate the entire form
  const validateForm = () => {
    resetErrors();
    
    const nameValid = validateName(name);
    const emailValid = validateEmail(email);
    const phoneValid = validatePhone(phone);
    const noteValid = validateNote(note);
    
    return nameValid && emailValid && phoneValid && noteValid;
  };

  // Handle the update operation
  const handleUpdateContact = async () => {
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
      "Update Contact", 
      "Are you sure you want to update this contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // Reference to the specific contact document
              const contactRef = doc(FIREBASE_DB, "contacts", contactId);
              
              // Update document in Firestore
              await updateDoc(contactRef, {
                name: properName,
                email: email,
                phone: phone,
                note: note,
                type: contactType === 'Select contact type' ? 'Other' : contactType,
                profileImage: profileImage,
                updatedAt: new Date()
              });
              
              // Show success message
              Alert.alert("Success", "Contact updated successfully", [
                {
                  text: "OK",
                  onPress: () => router.back()
                }
              ]);
            } catch (error) {
              console.error("Error updating contact: ", error);
              Alert.alert("Error", "Failed to update contact. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Handle back button navigation
  const handleBackPress = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading contact information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Contact</Text>
        <View style={styles.headerRight} />
      </View>
      
      <Animated.ScrollView 
        style={[styles.formContainer, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image 
              source={profileImage} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {name ? name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.cameraIconContainer} onPress={handleImagePick}>
            <Ionicons name="camera" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.inputLabel}>Name <Text style={styles.requiredStar}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          placeholder="Contact name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={handleNameChange}
          onBlur={handleNameBlur}
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : (
          <Text style={styles.infoText}>First letter capital, rest lowercase (e.g., John)</Text>
        )}
        
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        
        <Text style={styles.inputLabel}>Phone <Text style={styles.requiredStar}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : null]}
          placeholder="Phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={handlePhoneChange}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
        
        <Text style={styles.inputLabel}>Note</Text>
        <TextInput
          style={[
            styles.input, 
            styles.multilineInput,
            errors.note ? styles.inputError : null
          ]}
          placeholder="Note for the contact"
          placeholderTextColor="#999"
          multiline
          value={note}
          onChangeText={handleNoteChange}
        />
        {errors.note ? <Text style={styles.errorText}>{errors.note}</Text> : null}
        {note ? <Text style={styles.characterCount}>{note.length}/500</Text> : null}
        
        <Text style={styles.inputLabel}>Contact Type</Text>
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(true)}>
          <View style={styles.dropdownContainer}>
            <Text style={contactType === 'Select contact type' ? styles.placeholderText : styles.dropdownText}>
              {contactType}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </View>
        </TouchableWithoutFeedback>
        
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateContact}>
          <Text style={styles.updateButtonText}>Update Contact</Text>
        </TouchableOpacity>
        
        <View style={styles.spacer} />
      </Animated.ScrollView>
      
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
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
                    setContactType(item);
                    setIsModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {groups.some(group => group.name === item) && (
                    <Text style={styles.groupBadge}>Group</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 80,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 135,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  requiredStar: {
    color: 'red',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 5,
    backgroundColor: '#F9F9F9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
  },
  characterCount: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    marginBottom: 10,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    padding: 12,
    marginBottom: 20,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  dropdownText: {
    color: '#000',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  groupBadge: {
    backgroundColor: '#4A90E2',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    marginLeft: 10,
    overflow: 'hidden',
  },
});