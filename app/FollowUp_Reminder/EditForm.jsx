import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
  } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import { useLocalSearchParams, useRouter } from 'expo-router';
  import { FIREBASE_DB } from '../../firebaseConfig';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import DateTimePickerModal from 'react-native-modal-datetime-picker';
  import moment from 'moment';
  
  const EditForm = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
  
    const [reminder, setReminder] = useState(null);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
  
    useEffect(() => {
      const fetchReminder = async () => {
        try {
          const docRef = doc(FIREBASE_DB, 'reminders', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setReminder(snap.data());
          }
        } catch (err) {
          console.error('Error fetching reminder:', err);
        }
      };
  
      if (id) fetchReminder();
    }, [id]);
    const validate = () => {
      const newErrors = {};
      if (!reminder.task?.trim()) newErrors.task = 'Task is required';
      if (!reminder.contact?.trim()) newErrors.contact = 'Contact is required';
      if (!reminder.dueDate?.trim()) newErrors.dueDate = 'Due date is required';
      if (!reminder.assignedTo?.trim()) newErrors.assignedTo = 'Assigned To is required';
      if (!reminder.status?.trim()) newErrors.status = 'Priority must be selected';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleUpdate = async () => {
      try {
        await updateDoc(doc(FIREBASE_DB, 'reminders', id), reminder);
        Alert.alert('Updated!', 'Reminder updated successfully.', [
          {
            text: 'OK',
            onPress: () => router.replace('/FollowUp_Reminder/Reminder_Summery'),
          },
        ]);
      } catch (err) {
        console.error('Update error:', err);
        Alert.alert('Error', 'Update failed.');
      }
    };
  
    const showDatePicker = () => setDatePickerVisible(true);
    const hideDatePicker = () => setDatePickerVisible(false);
    const handleConfirmDate = (date) => {
      setReminder({ ...reminder, dueDate: moment(date).format('YYYY-MM-DD') });
      hideDatePicker();
    };
  
    const setPriority = (level) => {
      setReminder({ ...reminder, status: level });
    };
  
    if (!reminder) {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={{ textAlign: 'center' }}>Loading...</Text>
        </SafeAreaView>
      );
    }
  
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.heading}>✏️ Edit Reminder</Text>
  
          <Text style={styles.label}>Task</Text>
          <TextInput
            style={styles.input}
            value={reminder.task}
            onChangeText={(text) => setReminder({ ...reminder, task: text })}
          />
  
          <Text style={styles.label}>Contact</Text>
          <TextInput
            style={styles.input}
            value={reminder.contact}
            onChangeText={(text) => setReminder({ ...reminder, contact: text })}
          />
  
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
            <Text style={{ color: reminder.dueDate ? '#000' : '#999' }}>
              {reminder.dueDate || 'Select date'}
            </Text>
          </TouchableOpacity>
  
          <DateTimePickerModal
            isVisible={datePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
          />
  
          <Text style={styles.label}>Assigned To</Text>
          <TextInput
            style={styles.input}
            value={reminder.assignedTo}
            onChangeText={(text) => setReminder({ ...reminder, assignedTo: text })}
          />
  
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {['Urgent', 'High', 'Normal', 'Low'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.priorityButton,
                  styles[`${level.toLowerCase()}Button`],
                  reminder.status === level && styles.selectedPriority,
                ]}
                onPress={() => setPriority(level)}
              >
                <Text style={styles.priorityText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
  
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveText}>Update</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  export default EditForm;
  
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    form: { padding: 20 },
    heading: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 20,
      textAlign: 'center',
    },
    label: {
      fontWeight: '500',
      marginBottom: 5,
      marginTop: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 6,
      marginBottom: 5,
    },
    priorityContainer: {
      flexDirection: 'row',
      marginTop: 5,
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    priorityButton: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 4,
      marginRight: 8,
      marginBottom: 8,
    },
    urgentButton: { backgroundColor: '#E74C3C' },
    highButton: { backgroundColor: '#F39C12' },
    normalButton: { backgroundColor: '#3498DB' },
    lowButton: { backgroundColor: '#95A5A6' },
    selectedPriority: {
      borderWidth: 2,
      borderColor: '#000',
    },
    priorityText: {
      color: 'white',
      fontWeight: '500',
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30,
    },
    cancelBtn: {
      backgroundColor: '#bbb',
      padding: 12,
      borderRadius: 6,
      flex: 1,
      marginRight: 10,
      alignItems: 'center',
    },
    saveBtn: {
      backgroundColor: '#2196F3',
      padding: 12,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
    },
    cancelText: { color: '#fff', fontWeight: '600' },
    saveText: { color: '#fff', fontWeight: '600' },
  });
  