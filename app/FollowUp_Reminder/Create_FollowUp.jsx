import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

const Create_FollowUp = () => {
  const router = useRouter();
  const [contact, setContact] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('');

  const handleCreateReminder = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Reminder Title is required.');
      return;
    }
    if (!dueDate.trim()) {
      Alert.alert('Validation Error', 'Due Date is required.');
      return;
    }
    if (!assignee.trim()) {
      Alert.alert('Validation Error', 'Assign To is required.');
      return;
    }
    
    Alert.alert('Success', 'Follow-up reminder created successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerText}>Create New Follow-Up Reminder</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Contact / Organization</Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter contact or organization"
            value={contact}
            onChangeText={setContact}
          />
          
          <Text style={styles.label}>Reminder Title<Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter reminder title"
            value={title}
            onChangeText={setTitle}
          />
          
          <Text style={styles.label}>Due Date<Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input}
            placeholder="Select date"
            value={dueDate}
            onChangeText={setDueDate}
          />
          
          <Text style={styles.label}>Assign To<Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input}
            placeholder="Select assignee"
            value={assignee}
            onChangeText={setAssignee}
          />
          
          <Text style={styles.label}>Select Priority</Text>
          <View style={styles.priorityContainer}>
            <TouchableOpacity 
              style={[styles.priorityButton, styles.urgentButton, priority === 'Urgent' && styles.selectedPriority]}
              onPress={() => setPriority('Urgent')}
            >
              <Text style={styles.priorityText}>Urgent</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.priorityButton, styles.highButton, priority === 'High' && styles.selectedPriority]}
              onPress={() => setPriority('High')}
            >
              <Text style={styles.priorityText}>High</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.priorityButton, styles.normalButton, priority === 'Normal' && styles.selectedPriority]}
              onPress={() => setPriority('Normal')}
            >
              <Text style={styles.priorityText}>Normal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.priorityButton, styles.lowButton, priority === 'Low' && styles.selectedPriority]}
              onPress={() => setPriority('Low')}
            >
              <Text style={styles.priorityText}>Low</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateReminder}
            >
              <Text style={styles.createButtonText}>Create Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create_FollowUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContainer: {
    padding: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
    marginTop: 10,
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 20,
  },
  priorityButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  urgentButton: {
    backgroundColor: '#E74C3C',
  },
  highButton: {
    backgroundColor: '#F39C12',
  },
  normalButton: {
    backgroundColor: '#3498DB',
  },
  lowButton: {
    backgroundColor: '#95A5A6',
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#000',
  },
  priorityText: {
    color: 'white',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#95A5A6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    flex: 1.5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
