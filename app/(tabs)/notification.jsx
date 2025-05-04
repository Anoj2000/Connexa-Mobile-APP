import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Vibration,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ReminderNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Register for push notifications
  useEffect(() => {
    const setupNotifications = async () => {
      await registerForPushNotificationsAsync();
      
      // Listen for incoming notifications
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification received:", notification);
        // Process incoming notification
        const reminderData = notification.request.content.data;
        if (reminderData) {
          addNotification(reminderData);
        }
      });

      // Listen for notification responses
      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification response:", response);
        // Handle notification tap
        const reminderData = response.notification.request.content.data;
        if (reminderData) {
          showNotificationModal(reminderData);
        }
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    };

    setupNotifications();
  }, []);

  // Check for due reminders periodically
  useEffect(() => {
    const checkDueReminders = async () => {
      try {
        console.log("Checking for due reminders...");
        const now = new Date();
        const remindersRef = collection(FIREBASE_DB, "reminders");
        
        // Query for pending reminders
        const q = query(remindersRef, where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        
        console.log(`Found ${querySnapshot.size} pending reminders`);
        
        const dueReminders = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            reminderDate: doc.data().reminderDate?.toDate ? doc.data().reminderDate.toDate() : new Date(doc.data().reminderDate)
          }))
          .filter(reminder => {
            // Check if reminder is due (within the last 5 minutes to now)
            const reminderTime = reminder.reminderDate.getTime();
            const fiveMinutesAgo = now.getTime() - (5 * 60 * 1000);
            const isDue = reminderTime >= fiveMinutesAgo && reminderTime <= now.getTime();
            console.log(`Reminder ${reminder.id}: ${reminder.title}, Time: ${reminder.reminderDate}, Is Due: ${isDue}`);
            return isDue;
          });
        
        console.log(`Found ${dueReminders.length} due reminders`);
        
        // Schedule notifications for due reminders
        for (const reminder of dueReminders) {
          console.log(`Processing due reminder: ${reminder.id} - ${reminder.title}`);
          
          // Update reminder status to triggered
          try {
            await updateDoc(doc(FIREBASE_DB, "reminders", reminder.id), {
              status: "triggered",
              triggeredAt: Timestamp.now()
            });
            console.log(`Updated reminder ${reminder.id} status to triggered`);
          } catch (error) {
            console.error(`Error updating reminder status: ${error}`);
          }
          
          await scheduleNotification(reminder);
          addNotification(reminder);
        }
      } catch (error) {
        console.error("Error checking due reminders:", error);
      }
    };

    // Check immediately when component mounts
    checkDueReminders();
    
    // Then check every 30 seconds
    const intervalId = setInterval(checkDueReminders, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Load existing notifications when component mounts
  useEffect(() => {
    const loadTriggeredReminders = async () => {
      try {
        const remindersRef = collection(FIREBASE_DB, "reminders");
        const q = query(remindersRef, where("status", "==", "triggered"));
        const querySnapshot = await getDocs(q);
        
        const triggeredReminders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          reminderDate: doc.data().reminderDate?.toDate ? doc.data().reminderDate.toDate() : new Date(doc.data().reminderDate)
        }));
        
        console.log(`Found ${triggeredReminders.length} triggered reminders to show`);
        
        // Add all triggered reminders to notifications state
        setNotifications(triggeredReminders);
        
        // If there are triggered reminders and no modal is showing, show the first one
        if (triggeredReminders.length > 0 && !visible) {
          showNotificationModal(triggeredReminders[0]);
        }
      } catch (error) {
        console.error("Error loading triggered reminders:", error);
      }
    };
    
    loadTriggeredReminders();
  }, []);

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    console.log("Registering for push notifications...");
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2979FF',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      console.log('Push notification permissions granted');
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  };

  // Schedule push notification - Using local notifications instead of push
  const scheduleNotification = async (reminder) => {
    try {
      console.log(`Scheduling notification for reminder: ${reminder.id}`);
      
      const title = reminder.title || `Reminder for ${reminder.contactName}`;
      const body = reminder.note || 'Time for your scheduled reminder';
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: reminder,
        },
        trigger: null, // Send immediately
      });
      
      console.log(`Notification scheduled with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  // Add notification to local state
  const addNotification = (notification) => {
    console.log(`Adding notification to state: ${notification.id} - ${notification.title}`);
    
    setNotifications(prevNotifications => {
      // Check if this notification already exists
      const exists = prevNotifications.some(n => n.id === notification.id);
      if (!exists) {
        // Add new notification and vibrate
        Vibration.vibrate();
        
        // If no modal is currently showing, show this notification
        if (!visible) {
          showNotificationModal(notification);
        }
        
        return [...prevNotifications, notification];
      }
      return prevNotifications;
    });
  };

  // Show notification in modal
  const showNotificationModal = (notification) => {
    console.log(`Showing modal for notification: ${notification.id} - ${notification.title}`);
    
    setCurrentNotification(notification);
    setVisible(true);
    
    // Animate the modal
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close notification modal
  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setCurrentNotification(null);
      
      // If there are other notifications, show the next one
      setTimeout(() => {
        if (notifications.length > 1) {
          const nextNotification = notifications.find(n => n.id !== currentNotification?.id);
          if (nextNotification) {
            showNotificationModal(nextNotification);
          }
        }
      }, 300);
    });
  };

  // Mark reminder as completed
  const markAsCompleted = async () => {
    if (!currentNotification) return;
    
    try {
      console.log(`Marking reminder as completed: ${currentNotification.id}`);
      
      await deleteDoc(doc(FIREBASE_DB, "reminders", currentNotification.id));
      
      // Remove from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== currentNotification.id)
      );
      
      closeModal();
    } catch (error) {
      console.error("Error completing reminder:", error);
    }
  };

  // Snooze reminder (reschedule for 15 minutes later)
  const snoozeReminder = async () => {
    if (!currentNotification) return;
    
    try {
      console.log(`Snoozing reminder: ${currentNotification.id}`);
      
      // Calculate new reminder time (15 minutes from now)
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 15);
      
      // Update the reminder in Firestore
      const reminderRef = doc(FIREBASE_DB, "reminders", currentNotification.id);
      await updateDoc(reminderRef, {
        reminderDate: Timestamp.fromDate(snoozeTime),
        status: "pending" // Reset status to pending so it will trigger again
      });
      
      console.log(`Reminder snoozed until: ${snoozeTime}`);
      
      // Remove current notification from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== currentNotification.id)
      );
      
      closeModal();
    } catch (error) {
      console.error("Error snoozing reminder:", error);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No date';
    return date.toLocaleDateString();
  };
  
  // Format time from date object
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating indicator for active notifications */}
      {notifications.length > 0 && !visible && (
        <TouchableOpacity
          style={styles.notificationIndicator}
          onPress={() => {
            // Show the first notification in the list
            if (notifications.length > 0) {
              showNotificationModal(notifications[0]);
            }
          }}
        >
          <View style={styles.indicatorBadge}>
            <Text style={styles.indicatorBadgeText}>{notifications.length}</Text>
          </View>
          <Ionicons name="notifications" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Notification Modal */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
            ]}
          >
            {currentNotification && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[
                    styles.reminderType,
                    { 
                      backgroundColor: 
                        currentNotification.interactionType === 'Email' ? '#E8F5E9' : 
                        currentNotification.interactionType === 'Message' ? '#E3F2FD' : '#F5F5F5'
                    }
                  ]}>
                    <Text style={[
                      styles.reminderTypeText,
                      { 
                        color: 
                          currentNotification.interactionType === 'Email' ? '#4CAF50' : 
                          currentNotification.interactionType === 'Message' ? '#2196F3' : '#9E9E9E'
                      }
                    ]}>
                      {currentNotification.interactionType || 'Reminder'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.reminderTitle}>{currentNotification.title}</Text>
                  
                  <View style={styles.contactInfo}>
                    <Ionicons name="person" size={18} color="#2979FF" style={styles.infoIcon} />
                    <Text style={styles.contactName}>{currentNotification.contactName || 'Unknown'}</Text>
                  </View>

                  {currentNotification.note && (
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteText}>{currentNotification.note}</Text>
                    </View>
                  )}

                  <View style={styles.timeInfo}>
                    <Ionicons name="time" size={18} color="#FF9800" style={styles.infoIcon} />
                    <Text style={styles.timeText}>
                      {formatDate(currentNotification.reminderDate)} at {formatTime(currentNotification.reminderDate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.snoozeButton}
                    onPress={snoozeReminder}
                  >
                    <Ionicons name="time-outline" size={20} color="#2979FF" />
                    <Text style={styles.snoozeButtonText}>Snooze 15m</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={markAsCompleted}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  notificationIndicator: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2979FF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
  },
  indicatorBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  indicatorBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 15,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 8,
  },
  contactName: {
    fontSize: 16,
    color: '#333',
  },
  noteContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  reminderType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  reminderTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
  },
  snoozeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2979FF',
    borderRadius: 5,
  },
  snoozeButtonText: {
    color: '#2979FF',
    marginLeft: 5,
    fontWeight: '500',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  completeButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default ReminderNotification;