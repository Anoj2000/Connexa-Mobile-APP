import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FIREBASE_DB } from '../../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

const Delete_FollowUp = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'reminders', id));

      Alert.alert('Success', 'Reminder deleted successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/FollowUp_Reminder/AllRemindersForDelete'),
        },
      ]);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete the reminder.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>🗑 Confirm Deletion</Text>
        <Text style={styles.text}>Are you sure you want to delete this reminder?</Text>
        <Text style={styles.warning}>This action cannot be undone.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  box: {
    backgroundColor: '#fff3f3',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#b71c1c',
  },
  text: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
  },
  warning: {
    fontSize: 14,
    color: '#b71c1c',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
