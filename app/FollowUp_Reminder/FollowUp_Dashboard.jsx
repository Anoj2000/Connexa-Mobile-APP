
//update
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar
} from 'react-native';


import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FollowUpDashboard = () => {
  const router = useRouter();
  const { newReminder } = useLocalSearchParams(); // Grab param from navigation

  const [searchText, setSearchText] = useState('');
  const [reminders, setReminders] = useState([]);

  // Add the passed reminder when screen opens
  useEffect(() => {
    if (newReminder) {
      try {
        const parsed = JSON.parse(newReminder);
        setReminders((prev) => [parsed, ...prev]);
      } catch (e) {
        console.error('Failed to parse reminder:', e);
      }
    }
  }, [newReminder]);

  const handleDoneReminder = (id) => {
    setReminders((prev) => prev.filter(item => item.id !== id));
  };

  const handleEditReminder = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/Edit_FollowUp',
      params: { id },
    });
  };

  const handleDeleteReminder = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/Delete_FollowUp',
      params: { id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Follow-Up Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reminders"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {reminders.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.task}</Text>
            <Text>Contact: {item.contact}</Text>
            <Text>Due: {item.dueDate}</Text>
            <Text>Assigned To: {item.assignedTo}</Text>
            <Text>Status: {item.status}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.doneBtn} onPress={() => handleDoneReminder(item.id)}>
                <Text>✅ Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleEditReminder(item.id)}>
                <Text>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteReminder(item.id)}>
                <Text>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FollowUpDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerText: { fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 12 },
  searchContainer: { marginBottom: 15 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  doneBtn: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 4,
  },
});
