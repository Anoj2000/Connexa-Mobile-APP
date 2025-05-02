//update
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { router } from 'expo-router';

export default function Notifications() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const remindersRef = collection(FIREBASE_DB, "reminders");
      const querySnapshot = await getDocs(remindersRef);
      
      const remindersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reminderDate: doc.data().reminderDate?.toDate() || new Date()
      }));
      
      // Sort reminders by date (most urgent first)
      remindersData.sort((a, b) => a.reminderDate - b.reminderDate);

      setReminders(remindersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      Alert.alert("Error", "Failed to load notifications");
      setLoading(false);
    }
  };

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

  // Get relative time description
  const getRelativeTimeDescription = (date) => {
    const now = new Date();
    const diff = date - now;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diff / (1000 * 60));
    
    if (diff < 0) {
      return "Past due";
    } else if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return "Just now";
    }
  };

  // Handle dismiss notification
  const dismissNotification = async (reminderItem) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "reminders", reminderItem.id));
      setReminders(reminders.filter(item => item.id !== reminderItem.id));
      Alert.alert("Success", "Notification dismissed");
    } catch (error) {
      console.error("Error dismissing notification:", error);
      Alert.alert("Error", "Failed to dismiss notification");
    }
  };

  // Handle mark as done
  const markAsDone = async (reminderItem) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "reminders", reminderItem.id));
      setReminders(reminders.filter(item => item.id !== reminderItem.id));
      Alert.alert("Success", "Reminder marked as completed");
    } catch (error) {
      console.error("Error completing reminder:", error);
      Alert.alert("Error", "Failed to complete reminder");
    }
  };

  // View associated interaction
  const viewInteraction = (reminderItem) => {
    // This would navigate to the interaction details
    // For now, just show details in an alert
    Alert.alert(
      "Interaction Details",
      `Contact: ${reminderItem.contactName}\nNote: ${reminderItem.note || 'No notes'}\nType: ${reminderItem.interactionType || 'N/A'}`
    );
  };

  // Render each notification item
  const renderNotification = ({ item }) => {
    const isPastDue = new Date(item.reminderDate) < new Date();
    const timeDescription = getRelativeTimeDescription(item.reminderDate);
    
    return (
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <View style={[styles.statusIndicator, 
            isPastDue ? styles.statusPastDue : styles.statusUpcoming
          ]} />
          <Text style={styles.timeDescription}>{timeDescription}</Text>
        </View>
        
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {item.note ? <Text style={styles.notificationNote}>{item.note}</Text> : null}
        
        <View style={styles.notificationMeta}>
          <View style={styles.contactBadge}>
            <Text style={styles.contactInitial}>
              {item.contactName ? item.contactName.charAt(0).toUpperCase() : 'C'}
            </Text>
            <Text style={styles.contactName}>{item.contactName}</Text>
          </View>
          
          <View style={[
            styles.typeBadge,
            { 
              backgroundColor: 
                item.interactionType === 'Email' ? '#E8F5E9' : 
                item.interactionType === 'Message' ? '#E3F2FD' : '#F5F5F5'
            }
          ]}>
            <Text style={[
              styles.typeText,
              { 
                color: 
                  item.interactionType === 'Email' ? '#4CAF50' : 
                  item.interactionType === 'Message' ? '#2196F3' : '#9E9E9E'
              }
            ]}>
              {item.interactionType || 'Interaction'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.scheduledTime}>
          Scheduled for {formatDate(item.reminderDate)} at {formatTimeFromDate(item.reminderDate)}
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => viewInteraction(item)}
          >
            <Ionicons name="eye-outline" size={18} color="#4A90E2" />
            <Text style={[styles.actionButtonText, styles.viewButtonText]}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => markAsDone(item)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
            <Text style={[styles.actionButtonText, styles.completeButtonText]}>Complete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => dismissNotification(item)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#FF5252" />
            <Text style={[styles.actionButtonText, styles.dismissButtonText]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchReminders}
        >
          <Ionicons name="refresh" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : reminders.length > 0 ? (
        <FlatList
          data={reminders}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={70} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>
            You don't have any reminders or notifications at the moment
          </Text>
         
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#F5F7FA',

    backgroundColor: '#f8f8f8',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: '#4A90E2',
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    backgroundColor: '#2979FF',
    paddingVertical: 15,
    paddingHorizontal: 15,

  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusUpcoming: {
    backgroundColor: '#4A90E2',
  },
  statusPastDue: {
    backgroundColor: '#FF5252',
  },
  timeDescription: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notificationNote: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 6,
  },
  contactName: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scheduledTime: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionButtonText: {
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: '#F0F7FF',
  },
  viewButtonText: {
    color: '#4A90E2',
  },
  completeButton: {
    backgroundColor: '#E8F5E9',
  },
  completeButtonText: {
    color: '#4CAF50',
  },
  dismissButton: {
    backgroundColor: '#FFEBEE',
  },
  dismissButtonText: {
    color: '#FF5252',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});