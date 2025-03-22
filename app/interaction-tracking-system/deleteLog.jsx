import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Image,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationDeleteScreen = ({ navigation, route }) => {
  // Get notification data from route params or use default
  const notification = route?.params?.notification || {};
  
  // State for managing which users have been removed
  const [accessibleUsers, setAccessibleUsers] = useState(
    route?.params?.accessibleUsers || []
  );
  
  // Validation state
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  
  // Check if deletion is valid (at least one user must remain)
  useEffect(() => {
    if (accessibleUsers.length === 0) {
      setIsValid(false);
      setError('At least one user must have access to this notification');
    } else {
      setIsValid(true);
      setError('');
    }
  }, [accessibleUsers]);
  
  // Handle removing a user
  const handleRemoveUser = (userId) => {
    setAccessibleUsers(accessibleUsers.filter(user => user.id !== userId));
  };
  
  // Handle delete button press
  const handleDelete = () => {
    if (!isValid) {
      Alert.alert('Unable to delete', error);
      return;
    }
    
    // Here you would handle the actual deletion
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // Perform deletion logic here
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Handle cancel button press
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8e8e93"
          />
          <Ionicons name="mic" size={18} color="#8e8e93" style={styles.micIcon} />
        </View>
        
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Today</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabButton}>
          <Text style={[styles.tabText, styles.blueTabText]}>This week</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Main Notification */}
        <View style={styles.mainNotificationContainer}>
          <View style={styles.checkboxContainer}>
            <Ionicons name="create-outline" size={20} color="#000" />
          </View>
          
          <Image 
            source={{ uri: notification.avatarUri || 'https://via.placeholder.com/100' }} 
            style={styles.avatar} 
          />
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.nameText}>{notification.name || 'Jhon smith'}</Text>
              <Text style={styles.timeText}>{notification.time || '9.15 AM'}</Text>
            </View>
            
            <Text style={styles.messageText}>
              {notification.message || 'Sent proposal draft for review..'}
            </Text>
            
            <Text style={styles.typeLabel}>
              {notification.typeLabel || 'Message'}-{notification.timestamp || '10.00 A.M'}
            </Text>
          </View>
        </View>
        
        {/* Currently Accessible Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>currently accessible by:</Text>
          
          {/* Accessible Users List */}
          {accessibleUsers.map((user) => (
            <View key={user.id} style={styles.accessibleUserContainer}>
              <Image 
                source={{ uri: user.avatarUri }} 
                style={styles.userAvatar} 
              />
              
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userTime}>{user.time}</Text>
                </View>
                
                <Text style={styles.userMessage}>
                  {user.message}
                </Text>
                
                <Text style={styles.userType}>
                  {user.type}-{user.timestamp}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveUser(user.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {/* Error message when validation fails */}
          {!isValid && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.deleteButton,
            !isValid && styles.disabledButton
          ]}
          onPress={handleDelete}
          disabled={!isValid}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingTop:50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9eb',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
    color: '#000',
  },
  micIcon: {
    marginLeft: 6,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '500',
  },
  blueTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  mainNotificationContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  checkboxContainer: {
    marginRight: 8,
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  messageText: {
    fontSize: 14,
    color: '#3c3c43',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#3c3c43',
    marginBottom: 12,
  },
  accessibleUserContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userTime: {
    fontSize: 14,
    color: '#8e8e93',
  },
  userMessage: {
    fontSize: 14,
    color: '#3c3c43',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: '#8e8e93',
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  removeButtonText: {
    color: '#ff3b30',
    fontSize: 14,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  cancelButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '48%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ffcccc',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.2,
  },
});

export default NotificationDeleteScreen;