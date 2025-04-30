import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { useLocalSearchParams, router } from 'expo-router';

export default function UpdateLogScreen() {
  const params = useLocalSearchParams();
  const { id } = params;
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docRef, setDocRef] = useState(null);
  
  // Form state
  const [contactName, setContactName] = useState('');
  const [note, setNote] = useState('');
  const [interactionType, setInteractionType] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  
  // Modal and picker states
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Data for pickers (only Email and Message)
  const interactionTypes = ['Email', 'Message'];

  // Handle back button navigation
  const handleBackPress = () => {
    router.push('/interaction-tracking-system/readLog');
  };

  // Format date as "Month Day, Year" (e.g., "April 2, 2025")
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time as "HH:MM AM/PM" (e.g., "11:30 PM")
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Parse date string to Date object
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  // Parse time string to Date object
  const parseTime = (timeString) => {
    if (!timeString) return new Date();
    
    try {
      const now = new Date();
      const [time, modifier] = timeString.split(' ');
      let [hours, minutes] = time.split(':');
      
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);
      
      if (modifier === 'PM' && hours < 12) {
        hours += 12;
      } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const newTime = new Date();
      newTime.setHours(hours);
      newTime.setMinutes(minutes);
      return newTime;
    } catch (error) {
      console.error("Error parsing time:", error);
      return new Date();
    }
  };

  // Fetch log data
  const fetchLogData = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        Alert.alert("Error", "No log ID provided");
        setLoading(false);
        return;
      }
      
      // Method 1: Get document directly if you have the document ID
      if (id.includes('/')) {
        // If id contains a path separator, it might be a full path
        const documentRef = doc(FIREBASE_DB, id);
        const docSnap = await getDoc(documentRef);
        
        if (docSnap.exists()) {
          const logData = docSnap.data();
          setDocRef(documentRef);
          populateFormData(logData);
          setLoading(false);
          return;
        }
      }
      
      // Method 2: Query the logs collection for the specific document
      const logsRef = collection(FIREBASE_DB, "logs");
      const q = query(logsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Try getting the document directly
        try {
          const documentRef = doc(FIREBASE_DB, "logs", id);
          const docSnap = await getDoc(documentRef);
          
          if (docSnap.exists()) {
            const logData = docSnap.data();
            setDocRef(documentRef);
            populateFormData(logData);
          } else {
            Alert.alert("Error", "Log not found");
          }
        } catch (docError) {
          console.error("Error fetching log by direct ID:", docError);
          Alert.alert("Error", "Log not found");
        }
      } else {
        // Get the first matching document
        const document = querySnapshot.docs[0];
        const logData = document.data();
        setDocRef(document.ref);
        populateFormData(logData);
      }
      
    } catch (error) {
      console.error("Error fetching log:", error);
      Alert.alert("Error", "Failed to load log data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Populate form data from Firestore document
  const populateFormData = (logData) => {
    if (!logData) return;
    
    setContactName(logData.contactName || '');
    setNote(logData.note || '');
    setInteractionType(logData.interactionType || '');
    
    // Parse stored date and time
    if (logData.date) {
      setDate(parseDate(logData.date));
    }
    
    if (logData.displayTime) {
      setTime(parseTime(logData.displayTime));
    } else if (logData.dateTime) {
      // If there's a dateTime field, use it for both date and time
      const dateTimeObj = logData.dateTime.toDate ? 
        logData.dateTime.toDate() : 
        new Date(logData.dateTime);
        
      setDate(dateTimeObj);
      setTime(dateTimeObj);
    }
  };
  
  useEffect(() => {
    fetchLogData();
  }, [id]);
  
  // Update log
  const handleUpdateLog = async () => {
    try {
      Keyboard.dismiss();
      setSaving(true);
      
      // Validate form
      if (!contactName.trim()) {
        Alert.alert("Error", "Contact name is required");
        setSaving(false);
        return;
      }
      
      if (!note.trim()) {
        Alert.alert("Error", "Note is required");
        setSaving(false);
        return;
      }
      
      if (!interactionType) {
        Alert.alert("Error", "Please select an interaction type");
        setSaving(false);
        return;
      }
      
      if (!docRef) {
        Alert.alert("Error", "Document reference not found");
        setSaving(false);
        return;
      }
      
      // Prepare the combined date and time
      const combinedDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );
      
      // Format time for storage
      const timeFormatted = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      
      // Update document
      await updateDoc(docRef, {
        contactName: contactName.trim(),
        note: note.trim(),
        interactionType,
        date: formatDate(date),
        displayTime: formatTime(time),
        time: timeFormatted,
        dateTime: combinedDateTime,
        updatedAt: serverTimestamp()
      });
      
      Alert.alert(
        "Success", 
        "Log updated successfully",
        [{ 
          text: "OK",
          onPress: () => router.push('/interaction-tracking-system/readLog')
        }]
      );
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update log: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle time change
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  // Render loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading log data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>     
          <View style={styles.formContainer}>
            {/* Contact Name (read-only) */}
            <Text style={styles.label}>Contact Name</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{contactName}</Text>
            </View>
            
            {/* Interaction Type */}
            <Text style={styles.label}>Select Interaction</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setIsTypeModalVisible(true)}
            >
              <Text style={!interactionType ? styles.placeholderText : styles.dropdownText}>
                {interactionType || 'Choose Type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            
            {/* Date Picker */}
            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dropdownText}>
                {formatDate(date)}
              </Text>
              <Ionicons name="calendar" size={20} color="#999" />
            </TouchableOpacity>
            
            {/* Time Picker */}
            <Text style={styles.label}>Select Time</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dropdownText}>
                {formatTime(time)}
              </Text>
              <Ionicons name="time" size={20} color="#999" />
            </TouchableOpacity>
            
            {/* Note */}
            <Text style={styles.label}>Note and Summary</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details about this interaction"
              placeholderTextColor="#999"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
            
            {/* Update Button */}
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={handleUpdateLog}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Update Log</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Interaction Type Modal */}
      <Modal
        visible={isTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Interaction Type</Text>
            <FlatList
              data={interactionTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setInteractionType(item);
                    setIsTypeModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {interactionType === item && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsTypeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    fontSize: 16,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
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
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
});