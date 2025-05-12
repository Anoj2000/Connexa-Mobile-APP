import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

const NewLogScreen = () => {
  const router = useRouter();
  const [contactName, setContactName] = useState('');
  const [selectedInteraction, setSelectedInteraction] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showInteractionOptions, setShowInteractionOptions] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Date and time state
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Interaction types (only Message and Email)
  const interactionTypes = ['Message', 'Email'];

  // Load contacts from Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, 'contacts'));
        const contactsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts: ', error);
        Alert.alert('Error', 'Failed to load contacts');
      }
    };
    
    fetchContacts();
  }, []);

  // Filter contacts based on input
  useEffect(() => {
    if (contactName.length > 0) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(contactName.toLowerCase())
      );
      setFilteredContacts(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredContacts([]);
      setShowSuggestions(false);
    }
  }, [contactName, contacts]);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display (12-hour format)
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle date change from picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle time change from picker
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  // Handle contact selection from suggestions
  const handleContactSelect = (name) => {
    setContactName(name);
    setShowSuggestions(false);
  };

  // Save log to Firestore
  const handleSaveLog = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!contactName.trim()) {
        throw new Error('Please enter a contact name');
      }

      if (!selectedInteraction) {
        throw new Error('Please select an interaction type');
      }

      if (!noteText.trim()) {
        throw new Error('Please add a note or summary');
      }

      // Prepare log data
      const logData = {
        contactName: contactName.trim(),
        interactionType: selectedInteraction,
        date: formatDate(date),
        time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`,
        displayTime: formatTime(time),
        note: noteText.trim(),
        createdAt: Timestamp.now(),
      };

      // Save to Firestore
      await addDoc(collection(FIREBASE_DB, 'logs'), logData);
      
      Alert.alert(
        "Success", 
        "Log created successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving log:', error);
      Alert.alert('Error', error.message || 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Log</Text>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Contact Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact name"
                value={contactName}
                onChangeText={setContactName}
                placeholderTextColor="#999"
                autoCapitalize="words"
                editable={!loading}
                onFocus={() => contactName.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {/* Contact Suggestions */}
              {showSuggestions && filteredContacts.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {filteredContacts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.suggestionItem}
                      onPress={() => handleContactSelect(item.name)}
                    >
                      <Text style={styles.suggestionText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Interaction Type Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Interaction</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setShowInteractionOptions(true)}
                disabled={loading}
              >
                <Text style={selectedInteraction ? styles.selectedText : styles.placeholderText}>
                  {selectedInteraction || 'Choose Type'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Date Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </View>

            {/* Time Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
                disabled={loading}
              >
                <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
              </TouchableOpacity>
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Note and Summary</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Add details about this interaction"
                value={noteText}
                onChangeText={setNoteText}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSaveLog}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Log'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Interaction Type Modal */}
        <Modal
          visible={showInteractionOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInteractionOptions(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowInteractionOptions(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.interactionOptions}>
                {interactionTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.interactionOption,
                      selectedInteraction === type && styles.selectedInteraction,
                      index === interactionTypes.length - 1 && styles.lastOption,
                    ]}
                    onPress={() => {
                      setSelectedInteraction(type);
                      setShowInteractionOptions(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.interactionText,
                        selectedInteraction === type && styles.selectedInteractionText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            is24Hour={false}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    color: '#000',
  },
  noteInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 12,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  selectedText: {
    color: '#000',
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#999',
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    zIndex: 1000,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  interactionOptions: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  interactionOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedInteraction: {
    backgroundColor: '#e6e6e6',
  },
  interactionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  selectedInteractionText: {
    fontWeight: '500',
    color: '#007AFF',
  },
});

export default NewLogScreen;