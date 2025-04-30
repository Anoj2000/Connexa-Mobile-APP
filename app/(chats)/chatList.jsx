import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, getDoc, doc } from 'firebase/firestore';

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const auth = FIREBASE_AUTH;
        
        if (!auth) {
          setError('Authentication service is not available');
          setLoading(false);
          return;
        }
        
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser) {
          setError('Please log in to view chat list');
          setLoading(false);
          return;
        }
        
        const currentUserId = firebaseUser.uid;
        
        if (!currentUserId) {
          throw new Error('Could not determine current user ID');
        }

        const usersCollection = collection(FIREBASE_DB, 'users');
        const q = query(usersCollection);
        const usersSnapshot = await getDocs(q);
        
        if (usersSnapshot.empty) {
          setUsers([]);
          setLoading(false);
          return;
        }
        
        const userPromises = [];
        
        usersSnapshot.forEach((docSnapshot) => {
          if (docSnapshot.id !== currentUserId) {
            const userData = docSnapshot.data();
            
            const userPromise = async () => {
              try {
                const chatId = [currentUserId, docSnapshot.id].sort().join('_');
                const chatDocRef = doc(FIREBASE_DB, 'chats', chatId);
                const chatDoc = await getDoc(chatDocRef);
                
                let lastMessage = '';
                let lastMessageTime = '';
                let timestamp = 0;
                let isCurrentUserLastSender = false;
                let senderName = '';
                
                if (chatDoc.exists()) {
                  const chatData = chatDoc.data();
                  
                  if (chatData.lastMessage) {
                    lastMessage = chatData.lastMessage.text || '';
                    timestamp = chatData.lastMessage.timestamp || 0;
                    isCurrentUserLastSender = chatData.lastMessage.senderId === currentUserId;
                    
                    // Set sender name
                    senderName = isCurrentUserLastSender ? 'You' : userData.fullName?.split(' ')[0] || 'User';
                    
                    if (timestamp) {
                      lastMessageTime = formatTime(new Date(timestamp));
                    }
                  }
                }
                
                return {
                  id: docSnapshot.id,
                  ...userData,
                  fullName: userData.fullName || userData.displayName || 'User',
                  profilePhotoUrl: userData.profilePhotoUrl || 'https://via.placeholder.com/50',
                  lastMessage,
                  timestamp,
                  time: lastMessageTime,
                  isCurrentUserLastSender,
                  senderName
                };
              } catch (error) {
                console.error(`Error fetching chat data for user ${docSnapshot.id}:`, error);
                return {
                  id: docSnapshot.id,
                  ...userData,
                  fullName: userData.fullName || userData.displayName || 'User',
                  profilePhotoUrl: userData.profilePhotoUrl || 'https://via.placeholder.com/50',
                  lastMessage: '',
                  timestamp: 0,
                  time: '',
                  isCurrentUserLastSender: false,
                  senderName: ''
                };
              }
            };
            
            userPromises.push(userPromise());
          }
        });
        
        const usersWithChatData = await Promise.all(userPromises);
        usersWithChatData.sort((a, b) => b.timestamp - a.timestamp);
        setUsers(usersWithChatData);
        
      } catch (error) {
        setError('Failed to load users: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); 

  const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } 
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } 
    else if ((now - date) < 7 * 24 * 60 * 60 * 1000) {
      const options = { weekday: 'short' };
      return date.toLocaleDateString([], options);
    } 
    else {
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
  };

  const navigateToChatRoom = (item) => {
    router.push({
      pathname: '/chatRoom',
      params: {
        userId: item.id,
        name: item.fullName || 'User',
        avatar: item.profilePhotoUrl || 'https://via.placeholder.com/50'
      }
    });
  };
  
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
            {item.time ? (
              <Text style={styles.time}>{item.time}</Text>
            ) : null}
          </View>
          {item.lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.senderName}: {item.lastMessage}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

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
              setUsers([]);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubText}>
            Start a new conversation with someone
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

  return (
    <SafeAreaView style={styles.container}>
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
    backgroundColor: '#f0f0f0',
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
    marginTop: 2,
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