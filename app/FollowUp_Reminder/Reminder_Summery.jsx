import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
  } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import { collection, getDocs } from 'firebase/firestore';
  import { FIREBASE_DB } from '../../firebaseConfig';
  import { useRouter } from 'expo-router';
  import { Ionicons } from '@expo/vector-icons';
  
  const Reminder_Summery = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const fetchReminders = async () => {
        try {
          const snapshot = await getDocs(collection(FIREBASE_DB, 'reminders'));
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReminders(list);
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
        <Text style={styles.title}>📋 All Reminders</Text>
        <ScrollView style={styles.scroll}>
          {reminders.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.task}>{item.task}</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/FollowUp_Reminder/EditForm',
                      params: { id: item.id },
                    })
                  }
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>Contact: {item.contact || '-'}</Text>
              <Text style={styles.label}>Due: {item.dueDate}</Text>
              <Text style={styles.label}>Assigned To: {item.assignedTo}</Text>
              <Text style={styles.label}>Priority: {item.status}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  export default Reminder_Summery;
  
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
    scroll: {
      flex: 1,
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
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    task: {
      fontSize: 16,
      fontWeight: '600',
    },
    label: {
      fontSize: 14,
      color: '#333',
      marginTop: 2,
    },
    errorText: {
      fontSize: 16,
      color: '#888',
      textAlign: 'center',
      marginTop: 40,
    },
  });
  