import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'

const Edit_FollowUp = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [priority, setPriority] = useState('');
  const [reminderData, setReminderData] = useState({
    contact: '',
    title: '',
    dueDate: '',
    time: '',
    assignTo: '',
    description: '',
  });

  // Simulate fetching data for the reminder to edit
  useEffect(() => {
    // In a real app, you would fetch the reminder data using the ID from params
    // This is just placeholder logic
    const fetchData = async () => {
      // Simulate API call with timeout
      setTimeout(() => {
        // Mock data - replace with actual API call
        const mockData = {
          contact: '',
          title: '',
          dueDate: '',
          time: '',
          assignTo: '',
          description: '',
          priority: ''
        };
        
        setReminderData(mockData);
        setPriority(mockData.priority);
      }, 300);
    };

    fetchData();
  }, [params.id]);

  const handleInputChange = (field, value) => {
    setReminderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Follow-Up Reminder</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Contact / Organization</Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter contact or organization"
            value={reminderData.contact}
            onChangeText={(text) => handleInputChange('contact', text)}
          />
          
          <Text style={styles.label}>Reminder Title<Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter reminder title"
            value={reminderData.title}
            onChangeText={(text) => handleInputChange('title', text)}
          />
          
          <Text style={styles.label}>Due Date<Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input}
            placeholder="Select date"
            value={reminderData.dueDate}
            onChangeText={(text) => handleInputChange('dueDate', text)}
          />
          
          <Text style={styles.label}>Time</Text>
          <TextInput 
            style={styles.input}
            placeholder="Select time"
            value={reminderData.time}
            onChangeText={(text) => handleInputChange('time', text)}
          />
          
          <Text style={styles.label}>Assign To<Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input}
            placeholder="Select assignee"
            value={reminderData.assignTo}
            onChangeText={(text) => handleInputChange('assignTo', text)}
          />
          
          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={styles.descriptionInput}
            placeholder="Enter description"
            multiline={true}
            numberOfLines={4}
            value={reminderData.description}
            onChangeText={(text) => handleInputChange('description', text)}
          />
          
          <Text style={styles.label}>Select</Text>
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
            
            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Update Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Edit_FollowUp

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
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: 'top',
    height: 100,
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
  updateButton: {
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
  updateButtonText: {
    color: 'white',
    fontWeight: '500',
  },
})