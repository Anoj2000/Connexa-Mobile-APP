import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

const AllRemindersForDelete = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const snapshot = await getDocs(collection(FIREBASE_DB, 'reminders'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReminders(data);
      } catch (err) {
        console.error('Error fetching reminders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2979FF" />
      </SafeAreaView>
    );
  }

  if (reminders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No reminders found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🗑 Select Reminder to Delete</Text>
      <ScrollView>
        {reminders.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.task}>{item.task}</Text>
            <Text style={styles.label}>Due: {item.dueDate}</Text>
            <Text style={styles.label}>Assigned To: {item.assignedTo}</Text>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() =>
                router.push({
                  pathname: '/FollowUp_Reminder/Delete_FollowUp',
                  params: { id: item.id }, // 👈 Pass ID here
                })
              }
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllRemindersForDelete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4ff',
    paddingTop: 30,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  task: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  deleteBtn: {
    backgroundColor: '#e53935',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
