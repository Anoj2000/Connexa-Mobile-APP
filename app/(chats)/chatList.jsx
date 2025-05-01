import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
// Don't import useUser if it's causing issues
// import { useUser } from '../Auth/Layout';

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Don't use the context hook since it's causing errors

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Starting to fetch users');
        setLoading(true);
        
        // Get Firebase Auth instance
        const auth = FIREBASE_AUTH;
        
        // Check if auth is properly initialized
        if (!auth) {
          console.error('Firebase Auth is not initialized');
          setError('Authentication service is not available');
          setLoading(false);
          return;
        }
        
        // Get the current user directly from Firebase Auth
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser) {
          console.log('No current user found, need to log in first');
          setError('Please log in to view chat list');
          setLoading(false);
          return;
        }
        
        console.log('Current user from Firebase Auth:', firebaseUser.uid);
        
        // Get the current user ID
        const currentUserId = firebaseUser.uid;
        
        if (!currentUserId) {
          throw new Error('Could not determine current user ID');
        }

        // Get all users from Firestore
        const usersCollection = collection(FIREBASE_DB, 'users');
        const q = query(usersCollection);
        console.log('Executing Firestore query...');
        
        const usersSnapshot = await getDocs(q);
        
        console.log('Users snapshot size:', usersSnapshot.size);
        
        if (usersSnapshot.empty) {
          console.log('No users found in database');
          setUsers([]);
          setLoading(false);
          return;
        }
        
        // Filter and map users
        const usersList = [];
        
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          // Skip the current user
          if (doc.id !== currentUserId) {
            console.log('Adding user to list:', doc.id, userData.fullName || userData.displayName);
            usersList.push({
              id: doc.id,
              ...userData,
              // Provide default values for required fields
              fullName: userData.fullName || userData.displayName || 'User',
              profilePhotoUrl: userData.profilePhotoUrl || 'https://via.placeholder.com/50',
              lastMessage: userData.lastMessage || 'Say Hi 👋',
              time: userData.lastMessageTime || 'Just now'
            });
          }
        });
        
        console.log('Final users list length:', usersList.length);
        setUsers(usersList);
        
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    console.log('ChatList component mounted');
    
    // Set up a refresh interval (optional)
    const refreshInterval = setInterval(fetchUsers, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshInterval);
      console.log('ChatList component unmounted');
    };
  }, []); // Remove dependency array since we're not using context

  // Navigation function to go to chat room
  const navigateToChatRoom = (item) => {
    console.log('Navigating to chat with user:', item.id);
    router.push({
      pathname: '/chatRoom',
      params: {
        userId: item.id,
        name: item.fullName || 'User',
        avatar: item.profilePhotoUrl || 'https://via.placeholder.com/50'
      }
    });
  };
  
  // Function to render each chat item
  const renderChatItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => navigateToChatRoom(item)}
      >
        <Image
          source={{ uri: item.profilePhotoUrl }}
          style={styles.avatar}
          defaultSource={require('../../assets/images/user1.jpg')}
        />
        <View style={styles.chatInfo}>
          <View style={styles.nameTimeContainer}>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2979FF" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              // Re-trigger useEffect by setting users to empty array
              setUsers([]);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubText}>
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setUsers([]);
            }}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main UI with users
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={users}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        style={styles.chatList}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: '#f0f0f0', // Placeholder color
  },
  chatInfo: {
    flex: 1,
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2979FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  }
});