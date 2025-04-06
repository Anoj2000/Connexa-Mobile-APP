import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  View,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const Create_FollowUp = () => {
  const router = useRouter();

  const [contact, setContact] = useState('');
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('');

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleDateConfirm = (date) => {
    setDueDate(moment(date).format('YYYY-MM-DD'));
    setDatePickerVisible(false);
  };

  const handleCreate = async () => {
    if (!task || !dueDate || !assignedTo) {
      return Alert.alert('Missing Fields', 'Please fill in all required fields.');
    }

    try {
      await addDoc(collection(FIREBASE_DB, 'reminders'), {
        contact,
        task,
        dueDate,
        assignedTo,
        status: priority,
      });

      Alert.alert('Success ✅', 'Reminder created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/FollowUp_Reminder/Reminder_Summery'),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error ❌', 'Failed to create reminder.');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://www.shutterstock.com/image-photo/human-communication-network-concept-resources-600nw-2003840618.jpg' }}
      style={styles.background}
      blurRadius={1}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>➕ Create Follow-Up</Text>

            <Text style={styles.label}>Contact / Organization</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact"
              value={contact}
              onChangeText={setContact}
            />

            <Text style={styles.label}>Task *</Text>
            <TextInput
              style={styles.input}
              placeholder="Follow-up task"
              value={task}
              onChangeText={setTask}
            />

            <Text style={styles.label}>Due Date *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setDatePickerVisible(true)}>
              <Text style={{ color: dueDate ? '#000' : '#999' }}>
                {dueDate || 'Select date'}
              </Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={datePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setDatePickerVisible(false)}
            />

            <Text style={styles.label}>Assigned To *</Text>
            <TextInput
              style={styles.input}
              placeholder="Assign to"
              value={assignedTo}
              onChangeText={setAssignedTo}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {['Urgent', 'High', 'Normal', 'Low'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    styles[`${level.toLowerCase()}Button`],
                    priority === level && styles.selectedPriority,
                  ]}
                  onPress={() => setPriority(level)}
                >
                  <Text style={styles.priorityText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createButtonText}>Create Reminder</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

export default Create_FollowUp;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 30,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 20,
  },
  priorityButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  urgentButton: { backgroundColor: '#E74C3C' },
  highButton: { backgroundColor: '#F39C12' },
  normalButton: { backgroundColor: '#3498DB' },
  lowButton: { backgroundColor: '#95A5A6' },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  priorityText: {
    color: '#fff',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 3 },
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
