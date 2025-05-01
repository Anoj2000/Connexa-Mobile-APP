import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { collection, getDocs, query, getDoc, doc } from 'firebase/firestore';


const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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

              // Get profile photo from user data
              const profilePhoto = userData.profilePhoto || null;
              
              return {
                id: docSnapshot.id,
                ...userData,
                fullName: userData.fullName || userData.displayName || 'User',
                profilePhoto: profilePhoto,
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
                profilePhoto: null,
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
      console.error('Failed to load users:', error);
      setError('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); 

  const onRefresh = () => {
    setRefreshing(true);
    setError(null);
    fetchUsers();
  };

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
        avatar: item.profilePhoto || null
      }
    });
  };
  
  const renderChatItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => navigateToChatRoom(item)}
        activeOpacity={0.7}
      >
        {/* Profile Image */}
        {item.profilePhoto ? (
          <Image
            source={{ uri: item.profilePhoto }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.profileInitials}>
            <Text style={styles.initialsText}>
              {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        )}

        <View style={styles.chatInfo}>
          <View style={styles.nameTimeContainer}>
            <Text style={styles.name}>{item.fullName}</Text>
            {item.time ? (
              <Text style={styles.time}>{item.time}</Text>
            ) : null}
          </View>
          
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchUsers();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubText}>
            Start a new conversation with someone
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              fetchUsers();
            }}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          style={styles.chatList}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A90E2']}
              tintColor="#4A90E2"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chatList: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#F0F0F0',
  },
  profileInitials: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chatInfo: {
    flex: 1,
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  noMessageText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4A90E2',
    marginTop: 10,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 25,
  }
});