import React, { useState } from 'react';
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
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

const NewLogScreen = () => {
  const router = useRouter();
  const [contactName, setContactName] = useState('');
  const [selectedInteraction, setSelectedInteraction] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showInteractionOptions, setShowInteractionOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Interaction types - Meeting removed
  const interactionTypes = ['Message', 'Email'];

  // Date options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = ['2021', '2022', '2023', '2024', '2025'];

  // Time options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Get current date and time for default values
  const currentDate = new Date();
  const [dateSelection, setDateSelection] = useState({
    month: months[currentDate.getMonth()],
    day: currentDate.getDate().toString(),
    year: currentDate.getFullYear().toString(),
  });

  const [timeSelection, setTimeSelection] = useState({
    hour: currentDate.getHours().toString().padStart(2, '0'),
    minute: currentDate.getMinutes().toString().padStart(2, '0'),
  });

  // Handle date selection
  const handleDateSelect = (type, value) => {
    setDateSelection(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  // Handle time selection
  const handleTimeSelect = (type, value) => {
    setTimeSelection(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  // Format time for display
  const formatTimeForDisplay = () => {
    const hour = parseInt(timeSelection.hour);
    const isPM = hour >= 12;
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${timeSelection.minute} ${isPM ? 'PM' : 'AM'}`;
  };

  // Get previous and next month for date selector display
  const getAdjacentMonths = () => {
    const currentMonthIndex = months.indexOf(dateSelection.month);
    const prevMonthIndex = (currentMonthIndex === 0) ? 11 : currentMonthIndex - 1;
    const nextMonthIndex = (currentMonthIndex === 11) ? 0 : currentMonthIndex + 1;
    
    return {
      prevMonth: months[prevMonthIndex],
      nextMonth: months[nextMonthIndex],
      prevDay: dateSelection.day === '1' ? '31' : (parseInt(dateSelection.day) - 1).toString(),
      nextDay: dateSelection.day === '31' ? '1' : (parseInt(dateSelection.day) + 1).toString(),
    };
  };

  const { prevMonth, nextMonth, prevDay, nextDay } = getAdjacentMonths();

  // Generate unique ID
  const generateUniqueId = () => {
    return `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  // Handle save log
  const handleSaveLog = async () => {
    // Validation for contact name (only alphabets and spaces allowed)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!contactName.trim()) {
      Alert.alert('Missing Info', 'Please enter a contact name.');
      return;
    } else if (!nameRegex.test(contactName.trim())) {
      Alert.alert('Invalid Input', 'Contact name should only contain letters and spaces.');
      return;
    }

    if (!selectedInteraction) {
      Alert.alert('Missing Info', 'Please select an interaction type.');
      return;
    }

    if (!noteText.trim()) {
      Alert.alert('Missing Info', 'Please add a note or summary.');
      return;
    }

    const logData = {
      id: generateUniqueId(),
      contactName: contactName.trim(),
      interactionType: selectedInteraction,
      date: `${dateSelection.month} ${dateSelection.day}, ${dateSelection.year}`,
      time: `${timeSelection.hour}:${timeSelection.minute}`,
      displayTime: formatTimeForDisplay(),
      note: noteText.trim(),
      createdAt: Timestamp.now(),
    };

    try {
      // Save log to Firestore
      const docRef = await addDoc(collection(FIREBASE_DB, 'logs'), logData);

      // Update the log data with the Firestore document ID
      logData.firestoreId = docRef.id;

      // Updated success message with navigation to home
      Alert.alert("Success", "Contact added successfully", [
        {
          text: "OK",
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error saving log: ', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Log</Text>
          <TouchableOpacity onPress={handleSaveLog}>
            <Text style={styles.addButton}>Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              value={contactName}
              onChangeText={setContactName}
              placeholderTextColor="#999"
              keyboardType="default"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Interaction</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setShowInteractionOptions(true)}
            >
              <Text style={selectedInteraction ? styles.selectedText : styles.placeholderText}>
                {selectedInteraction || 'Choose Type'}
              </Text>
              <Text style={styles.dropdownArrow}>∨</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Date</Text>
            <TouchableOpacity
              style={styles.dateContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateRow}>
                <Text style={[styles.dateText, styles.dateTextInactive]}>{prevMonth}</Text>
                <Text style={[styles.dateNumber, styles.dateTextInactive]}>{prevDay}</Text>
                <Text style={[styles.dateText, styles.dateTextInactive]}>{dateSelection.year}</Text>
              </View>

              <View style={[styles.dateRow, styles.selectedDateRow]}>
                <Text style={styles.dateText}>{dateSelection.month}</Text>
                <Text style={styles.dateNumber}>{dateSelection.day}</Text>
                <Text style={styles.dateText}>{dateSelection.year}</Text>
              </View>

              <View style={styles.dateRow}>
                <Text style={[styles.dateText, styles.dateTextInactive]}>{nextMonth}</Text>
                <Text style={[styles.dateNumber, styles.dateTextInactive]}>{nextDay}</Text>
                <Text style={[styles.dateText, styles.dateTextInactive]}>{dateSelection.year}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Time</Text>
            <TouchableOpacity
              style={styles.timeContainer}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTimeForDisplay()}</Text>
              <Text style={styles.dropdownArrow}>∨</Text>
            </TouchableOpacity>
          </View>

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
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
            <Text style={styles.saveButtonText}>Save Log</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Interaction Selection Modal */}
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

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.datePicker}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateSelectors}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Month</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.datePickerScrollContent}
                  >
                    {months.map((month, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          dateSelection.month === month && styles.selectedDateOption,
                        ]}
                        onPress={() => handleDateSelect('month', month)}
                      >
                        <Text
                          style={
                            dateSelection.month === month
                              ? styles.selectedDateText
                              : styles.dateOptionText
                          }
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Day</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.datePickerScrollContent}
                  >
                    {days.map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          dateSelection.day === day && styles.selectedDateOption,
                        ]}
                        onPress={() => handleDateSelect('day', day)}
                      >
                        <Text
                          style={
                            dateSelection.day === day
                              ? styles.selectedDateText
                              : styles.dateOptionText
                          }
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Year</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.datePickerScrollContent}
                  >
                    {years.map((year, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          dateSelection.year === year && styles.selectedDateOption,
                        ]}
                        onPress={() => handleDateSelect('year', year)}
                      >
                        <Text
                          style={
                            dateSelection.year === year
                              ? styles.selectedDateText
                              : styles.dateOptionText
                          }
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <View style={styles.datePicker}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateSelectors}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Hour</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.datePickerScrollContent}
                  >
                    {hours.map((hour, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          timeSelection.hour === hour && styles.selectedDateOption,
                        ]}
                        onPress={() => handleTimeSelect('hour', hour)}
                      >
                        <Text
                          style={
                            timeSelection.hour === hour
                              ? styles.selectedDateText
                              : styles.dateOptionText
                          }
                        >
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Minute</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.datePickerScrollContent}
                  >
                    {minutes.map((minute, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          timeSelection.minute === minute && styles.selectedDateOption,
                        ]}
                        onPress={() => handleTimeSelect('minute', minute)}
                      >
                        <Text
                          style={
                            timeSelection.minute === minute
                              ? styles.selectedDateText
                              : styles.dateOptionText
                          }
                        >
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 16 : 30,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    color: '#007AFF',
    fontSize: 16,
    width: 60,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
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
    height: 100,
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
  dateContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDateRow: {
    backgroundColor: '#f8f8f8',
  },
  dateText: {
    fontSize: 16,
    flex: 1,
    color: '#000',
  },
  dateNumber: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    color: '#000',
  },
  dateTextInactive: {
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  dateSelectors: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
    height: 220,
  },
  dateColumnHeader: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
    fontWeight: '500',
  },
  datePickerScrollContent: {
    paddingVertical: 10,
  },
  dateOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  selectedDateOption: {
    backgroundColor: '#f0f8ff',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default NewLogScreen;