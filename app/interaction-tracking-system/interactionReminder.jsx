import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { router } from 'expo-router';

const InteractionReminder = () => {
  // States for the form and data
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [reminderTitle, setReminderTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [scheduledReminders, setScheduledReminders] = useState([]);
  
  // Date input fields
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());

  // Fetch logs from Firestore
  useEffect(() => {
    fetchLogs();
    fetchScheduledReminders();
  }, []);

  // Set initial date and time values
  useEffect(() => {
    const now = new Date();
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    
    setDateValue(formatDateForInput(tomorrow));
    setTimeValue(formatTimeForInput(now));
    setReminderDate(tomorrow);
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No date';
    return date.toLocaleDateString();
  };
  
  // Format time from date object
  const formatTimeFromDate = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time for input field
  const formatTimeForInput = (date) => {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Update date from input field
  const handleDateChange = (value) => {
    setDateValue(value);
    const [year, month, day] = value.split('-').map(Number);
    const newDate = new Date(reminderDate);
    newDate.setFullYear(year, month - 1, day);
    setReminderDate(newDate);
  };

  // Update time from input field
  const handleTimeChange = (value) => {
    setTimeValue(value);
    const [hours, minutes] = value.split(':').map(Number);
    const newDate = new Date(reminderDate);
    newDate.setHours(hours, minutes);
    setReminderDate(newDate);
  };

  // Fetch logs from Firestore
  const fetchLogs = async () => {
    try {
      const logsRef = collection(FIREBASE_DB, "logs");
      const q = query(logsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const logsData = querySnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        displayDate: formatDate(doc.data().createdAt?.toDate()),
        displayTime: formatTimeFromDate(doc.data().createdAt?.toDate()),
        interactionType: doc.data().interactionType || 'Message'
      }));
      
      setLogs(logsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      Alert.alert("Error", "Failed to load interaction logs");
      setLoading(false);
    }
  };

  // Fetch scheduled reminders
  const fetchScheduledReminders = async () => {
    try {
      const remindersRef = collection(FIREBASE_DB, "reminders");
      const querySnapshot = await getDocs(remindersRef);
      
      const remindersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reminderDate: doc.data().reminderDate?.toDate() || new Date()
      }));
      
      setScheduledReminders(remindersData);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // Schedule a reminder
  const scheduleReminder = async () => {
    if (!selectedLog) {
      Alert.alert("Error", "Please select an interaction for the reminder");
      return;
    }

    if (!reminderTitle.trim()) {
      Alert.alert("Error", "Please enter a reminder title");
      return;
    }

    // Ensure reminder date is in the future
    if (reminderDate <= new Date()) {
      Alert.alert("Error", "Reminder date must be in the future");
      return;
    }

    try {
      // Save the reminder to Firestore
      const reminderData = {
        logId: selectedLog.firestoreId,
        contactName: selectedLog.contactName,
        title: reminderTitle,
        note: selectedLog.note, // Using note from the selected log
        interactionType: selectedLog.interactionType, // Using interaction type from the selected log
        reminderDate,
        createdAt: new Date(),
        status: 'pending',
      };

      await addDoc(collection(FIREBASE_DB, "reminders"), reminderData);
      
      // Show alert notification
      Alert.alert(
        "Reminder Scheduled",
        `Reminder for ${selectedLog.contactName} set for ${formatDate(reminderDate)} at ${formatTimeFromDate(reminderDate)}`
      );
      
      // Reset form and refresh reminders
      resetForm();
      fetchScheduledReminders();
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      Alert.alert("Error", "Failed to schedule reminder");
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedLog(null);
    setReminderTitle('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setReminderDate(tomorrow);
    setDateValue(formatDateForInput(tomorrow));
  };

  // Cancel a scheduled reminder
  const cancelReminder = async (reminder) => {
    Alert.alert(
      "Cancel Reminder",
      "Are you sure you want to cancel this reminder?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            try {
              // Delete from Firestore
              await deleteDoc(doc(FIREBASE_DB, "reminders", reminder.id));
              
              // Refresh the list
              fetchScheduledReminders();
              
              Alert.alert("Success", "Reminder cancelled successfully");
            } catch (error) {
              console.error("Error cancelling reminder:", error);
              Alert.alert("Error", "Failed to cancel reminder");
            }
          }
        }
      ]
    );
  };

  // Mark a reminder as completed
  const completeReminder = async (reminder) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "reminders", reminder.id));
      fetchScheduledReminders();
      Alert.alert("Success", "Reminder marked as completed");
    } catch (error) {
      console.error("Error completing reminder:", error);
      Alert.alert("Error", "Failed to complete reminder");
    }
  };

  // Render log item for selection
  const renderLogItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.logItem,
        selectedLog?.firestoreId === item.firestoreId && styles.selectedLogItem
      ]}
      onPress={() => {
        setSelectedLog(item);
        setReminderTitle(`Follow up with ${item.contactName}`);
      }}
    >
      <View style={styles.logItemContent}>
        <View style={styles.logAvatar}>
          <Text style={styles.avatarText}>
            {item.contactName ? item.contactName.charAt(0).toUpperCase() : 'L'}
          </Text>
        </View>
        <View style={styles.logDetails}>
          <Text style={styles.contactName}>{item.contactName || 'No Name'}</Text>
          <Text style={styles.logNote} numberOfLines={1}>
            {item.note || 'No notes'}
          </Text>
          <View style={styles.logMeta}>
            <Text style={styles.logDate}>{item.displayDate}</Text>
            <Text style={styles.logTime}>{item.displayTime}</Text>
            <View style={[
              styles.logType,
              { 
                backgroundColor: 
                  item.interactionType === 'Email' ? '#E8F5E9' : 
                  item.interactionType === 'Message' ? '#E3F2FD' : '#F5F5F5'
              }
            ]}>
              <Text style={[
                styles.logTypeText,
                { 
                  color: 
                    item.interactionType === 'Email' ? '#4CAF50' : 
                    item.interactionType === 'Message' ? '#2196F3' : '#9E9E9E'
                }
              ]}>
                {item.interactionType}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render scheduled reminder item
  const renderReminderItem = ({ item }) => {
    const isPastDue = new Date(item.reminderDate) < new Date();
    
    return (
      <View style={[styles.reminderItem, isPastDue && styles.pastDueReminder]}>
        <View style={styles.reminderDetails}>
          <Text style={styles.reminderTitle}>{item.title}</Text>
          {item.note ? <Text style={styles.reminderNote}>{item.note}</Text> : null}
          <View style={styles.reminderMeta}>
            <Text style={[styles.reminderDate, isPastDue && styles.pastDueText]}>
              {formatDate(item.reminderDate)} at {formatTimeFromDate(item.reminderDate)}
              {isPastDue ? ' (Past due)' : ''}
            </Text>
            <View style={[
              styles.reminderType,
              { 
                backgroundColor: 
                  item.interactionType === 'Email' ? '#E8F5E9' : 
                  item.interactionType === 'Message' ? '#E3F2FD' : '#F5F5F5'
              }
            ]}>
              <Text style={[
                styles.reminderTypeText,
                { 
                  color: 
                    item.interactionType === 'Email' ? '#4CAF50' : 
                    item.interactionType === 'Message' ? '#2196F3' : '#9E9E9E'
                }
              ]}>
                {item.interactionType}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.reminderActions}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => completeReminder(item)}
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => cancelReminder(item)}
          >
            <Ionicons name="close-circle" size={24} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()} 
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interaction Reminders</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Select Log Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select an Interaction</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#2979FF" />
          ) : (
            <View style={styles.logsList}>
              {logs.length > 0 ? (
                <FlatList
                  data={logs.slice(0, 5)} // Limit to 5 most recent logs
                  renderItem={renderLogItem}
                  keyExtractor={item => item.firestoreId}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              ) : (
                <Text style={styles.emptyText}>No interaction logs available</Text>
              )}
            </View>
          )}
        </View>

        {/* Reminder Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Details</Text>
          <View style={styles.formContainer}>
            {selectedLog && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Contact Name</Text>
                  <View style={styles.disabledInput}>
                    <Text style={styles.disabledInputText}>{selectedLog.contactName || 'No Name'}</Text>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Note</Text>
                  <View style={styles.disabledInput}>
                    <Text style={styles.disabledInputText}>{selectedLog.note || 'No notes'}</Text>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Interaction Type</Text>
                  <View style={styles.disabledInput}>
                    <Text style={styles.disabledInputText}>{selectedLog.interactionType || 'No type'}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={reminderTitle}
                onChangeText={setReminderTitle}
                placeholder="Enter reminder title"
              />
            </View>

            <View style={styles.dateTimeContainer}>
              <View style={styles.datePickerContainer}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={dateValue}
                  onChangeText={handleDateChange}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.timePickerContainer}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.textInput}
                  value={timeValue}
                  onChangeText={handleTimeChange}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.scheduleButton,
                (!selectedLog || !reminderTitle.trim()) && styles.disabledButton
              ]}
              onPress={scheduleReminder}
              disabled={!selectedLog || !reminderTitle.trim()}
            >
              <Text style={styles.scheduleButtonText}>Schedule Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scheduled Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Reminders</Text>
          <View style={styles.remindersContainer}>
            {scheduledReminders.length > 0 ? (
              scheduledReminders.map(reminder => (
                <View key={reminder.id}>
                  {renderReminderItem({item: reminder})}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No scheduled reminders</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2979FF',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  logsList: {
    marginBottom: 10,
  },
  logItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 250,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  selectedLogItem: {
    borderColor: '#2979FF',
    borderWidth: 2,
  },
  logItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  logNote: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logDate: {
    color: '#999',
    fontSize: 12,
    marginRight: 10,
  },
  logTime: {
    color: '#999',
    fontSize: 12,
    marginRight: 10,
  },
  logType: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
  },
  logTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
  },
  disabledInputText: {
    fontSize: 16,
    color: '#666',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  timePickerContainer: {
    flex: 1,
    marginLeft: 10,
  },
  scheduleButton: {
    backgroundColor: '#2979FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  remindersContainer: {
    marginTop: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  pastDueReminder: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  reminderNote: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reminderDate: {
    color: '#999',
    fontSize: 12,
    marginRight: 10,
  },
  pastDueText: {
    color: '#FF5252',
    fontWeight: '500',
  },
  reminderType: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  reminderTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reminderActions: {
    flexDirection: 'row',
  },
  completeButton: {
    padding: 5,
    marginRight: 5,
  },
  cancelButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  }
});

export default InteractionReminder;