import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_RTDB } from '../../firebaseConfig';
import {
  ref,
  push,
  set,
  onValue,
  query,
  orderByChild,
  get,
} from 'firebase/database';

const ChatRoom = () => {
  const { userId, name, avatar } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);

  // Get the current user
  useEffect(() => {
    const auth = FIREBASE_AUTH;
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser);
      
      // Fetch current user details for display
      const fetchUserDetails = async () => {
        try {
          const userRef = ref(FIREBASE_RTDB, `users/${auth.currentUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            setCurrentUser({
              ...auth.currentUser,
              ...snapshot.val()
            });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };
      
      fetchUserDetails();
    }
  }, []);

  // Load chat messages
  useEffect(() => {
    if (!userId || !currentUser) return;

    // Create a unique chat ID based on the two user IDs
    const chatId = [currentUser.uid, userId].sort().join('_');
    
    console.log(`Subscribing to messages for chat: ${chatId}`);
    
    // Reference to the messages in this chat
    const messagesRef = ref(FIREBASE_RTDB, `chats/${chatId}/messages`);
    
    // Query to order messages by timestamp
    const messagesQuery = query(messagesRef, orderByChild('createdAt'));
    
    // Set up real-time listener
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData = [];
      
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        // Ensure timestamp is a valid number before conversion
        const timestamp = typeof message.createdAt === 'number' ? message.createdAt : Date.now();
        
        messagesData.push({
          id: childSnapshot.key,
          ...message,
          // Store both timestamp and Date object for reliable rendering
          timestamp: timestamp,
          createdAt: new Date(timestamp)
        });
      });
      
      console.log(`Received ${messagesData.length} messages`);
      setMessages(messagesData);
      setLoading(false);
      
      // Scroll to bottom when messages load
      if (messagesData.length > 0 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: false });
        }, 100);
      }
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });
    
    // Clean up listener
    return () => unsubscribe();
  }, [userId, currentUser]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !userId || !currentUser) return;
    
    try {
      // Create a unique chat ID based on the two user IDs
      const chatId = [currentUser.uid, userId].sort().join('_');
      
      // Reference to the messages in this chat
      const messagesRef = ref(FIREBASE_RTDB, `chats/${chatId}/messages`);
      
      // Generate a new message ID
      const newMessageRef = push(messagesRef);
      
      // Current timestamp
      const timestamp = Date.now();
      
      // Message data
      const messageData = {
        text: inputMessage.trim(),
        createdAt: timestamp,  // Use timestamp for Realtime DB
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.fullName || 'User',
        receiverId: userId
      };
      
      // Save the message
      await set(newMessageRef, messageData);
      
      // Clear input
      setInputMessage('');
      
      // Update last message for both users for chat list preview
      const lastMessageData = {
        text: inputMessage.trim(),
        timestamp: timestamp,
        senderId: currentUser.uid
      };
      
      // Update chat metadata
      await set(ref(FIREBASE_RTDB, `chats/${chatId}/metadata`), {
        lastMessage: lastMessageData,
        updatedAt: timestamp,
        participants: {
          [currentUser.uid]: true,
          [userId]: true
        }
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleGoBack = () => {
    router.back();
  };
  
  const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Render each message
  const renderMessage = ({ item, index }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    
    // Skip rendering if invalid data
    if (!item || !item.text) return null;
    
    // Get message time
    const messageTime = formatTime(item.createdAt);
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessageContainer : styles.receivedMessageContainer
      ]}>
        {!isCurrentUser && (
          <Image 
            source={{ uri: avatar || undefined }} 
            style={styles.messageAvatar} 
            defaultSource={require('../../assets/images/user1.jpg')}
          />
        )}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentMessageBubble : styles.receivedMessageBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={[
          styles.messageTime,
          isCurrentUser ? styles.sentMessageTime : styles.receivedMessageTime
        ]}>
          {messageTime}
        </Text>
        {isCurrentUser && (
          <Image 
            source={{ uri: currentUser?.profilePhotoUrl || undefined }} 
            style={styles.messageAvatar}
            defaultSource={require('../../assets/images/user1.jpg')}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Image 
            source={{ uri: avatar || undefined }} 
            style={styles.headerAvatar}
            defaultSource={require('../../assets/images/user1.jpg')}
          />
          <Text style={styles.headerName}>{name}</Text>
        </View>
      </View>
      
      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id || `msg-${item.timestamp}-${Math.random()}`}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          extraData={messages.length} // Force re-render when new messages arrive
        />
      )}
      
      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        
        <TextInput
          style={styles.input}
          placeholder="Text Message + RCS"
          placeholderTextColor="#999"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline={true}
          maxHeight={100}
        />
        
        {inputMessage.trim().length > 0 ? (
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  videoCallButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 30,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  sentMessageContainer: {
    justifyContent: 'flex-end',
  },
  receivedMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 5,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
  },
  sentMessageBubble: {
    backgroundColor: '#4CD964', // Green color for sent messages
    borderBottomRightRadius: 4,
  },
  receivedMessageBubble: {
    backgroundColor: '#F2F2F2', // Light gray for received messages
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginHorizontal: 5,
    alignSelf: 'flex-end',
  },
  sentMessageTime: {
    textAlign: 'right',
  },
  receivedMessageTime: {
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f8f8',
  },
  attachButton: {
    padding: 8,
    marginRight: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  micButton: {
    padding: 8,
    marginLeft: 5,
  },
  sendButton: {
    padding: 8,
    marginLeft: 5,
  },
});