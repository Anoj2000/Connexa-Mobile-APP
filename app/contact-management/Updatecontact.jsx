import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,SafeAreaView,TouchableWithoutFeedback,Modal,FlatList,Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UpdateContact() {
  const [contactType, setContactType] = useState('Select contact type');
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const contactTypes = ['Family', 'Friend', 'Office'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.profileImage} 
          />
          <TouchableOpacity style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Contact name"
          placeholderTextColor="#999"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Note for the contact"
          placeholderTextColor="#999"
        />
        
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(true)}>
          <View style={styles.dropdownContainer}>
            <Text style={contactType === 'Select contact type' ? styles.placeholderText : styles.dropdownText}>
              {contactType}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </View>
        </TouchableWithoutFeedback>
        
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.bottomBar} />
      
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
    backgroundColor: '#E1E1E1',
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
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    fontSize: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 4,
    backgroundColor: '#F6F6F6',
    padding: 12,
    marginTop: 8,
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
    marginTop: 24,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    height: 5,
    width: 120,
    backgroundColor: '#000',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
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
});