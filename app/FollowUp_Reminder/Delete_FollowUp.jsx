import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'

const Delete_FollowUp = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Mock reminder data - in a real app, you would fetch this using the ID
  const reminder = {
    title: 'Acme Corp - Contract Renewal Follow-up',
    dueDate: 'Feb 28, 2025 at 17:30',
    assignedTo: 'You',
    priority: 'Urgent'
  };
  
  const handleDelete = () => {
    // Logic to delete the reminder goes here
    // After deletion, navigate back
    router.back();
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Delete Reminder</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.confirmationBox}>
          <View style={styles.confirmationHeader}>
            <Text style={styles.confirmationTitle}>Confirm Deletion</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.confirmationContent}>
            <Text style={styles.confirmationText}>
              Are you sure you want to delete the following reminder?
            </Text>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text style={styles.reminderDetail}>Due: {reminder.dueDate}</Text>
            <Text style={styles.reminderDetail}>• Assigned to: {reminder.assignedTo}</Text>
            <Text style={styles.reminderDetail}>• Priority: {reminder.priority}</Text>
            
            <Text style={styles.warningText}>
              This action cannot be undone.
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Delete_FollowUp;

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
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationBox: {
    width: '100%',
    backgroundColor: '#f8d7da',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  confirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5c6cb',
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#721c24',
  },
  closeButton: {
    fontSize: 22,
    fontWeight: '700',
    color: '#721c24',
  },
  confirmationContent: {
    padding: 15,
  },
  confirmationText: {
    fontSize: 14,
    color: '#721c24',
    marginBottom: 10,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#721c24',
    marginBottom: 5,
  },
  reminderDetail: {
    fontSize: 14,
    color: '#721c24',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 14,
    color: '#721c24',
    marginTop: 15,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#95A5A6',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 4,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});