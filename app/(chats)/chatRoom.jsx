import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_RTDB, FIREBASE_DB } from '../../firebaseConfig';
import {
  ref,
  push,
  set,
  onValue,
  query,
  orderByChild,
  get
} from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';

const ChatRoom = () => {
  const { userId, name } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  const flatListRef = useRef(null);
  const API_URL = 'https://73c8-2402-4000-2270-185-8103-a401-f2d3-c729.ngrok-free.app/predict';


  // Get current user data
  useEffect(() => {
    const auth = FIREBASE_AUTH;
    if (auth.currentUser) {
      const fetchUserDetails = async () => {
        try {
          const userRef = doc(FIREBASE_DB, 'users', auth.currentUser.uid);
          const snapshot = await getDoc(userRef);
          
          if (snapshot.exists()) {
            setCurrentUser({
              ...auth.currentUser,
              ...snapshot.data(),
              profilePhotoUrl: snapshot.data().profilePhoto || null
            });
          } else {
            const rtdbUserRef = ref(FIREBASE_RTDB, `users/${auth.currentUser.uid}`);
            const rtdbSnapshot = await get(rtdbUserRef);
            
            if (rtdbSnapshot.exists()) {
              setCurrentUser({
                ...auth.currentUser,
                ...rtdbSnapshot.val(),
                profilePhotoUrl: rtdbSnapshot.val().profilePhoto || null
              });
            } else {
              setCurrentUser(auth.currentUser);
            }
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setCurrentUser(auth.currentUser);
        }
      };
      fetchUserDetails();
    }
  }, []);

  // Fetch recipient data
  useEffect(() => {
    if (!userId) return;

    const fetchRecipientData = async () => {
      try {
        const userRef = doc(FIREBASE_DB, 'users', userId);
        const snapshot = await getDoc(userRef);
        
        if (snapshot.exists()) {
          setRecipientData({
            id: userId,
            name: name || snapshot.data().fullName || 'User',
            profilePhoto: snapshot.data().profilePhoto || null
          });
        } else {
          const rtdbUserRef = ref(FIREBASE_RTDB, `users/${userId}`);
          const rtdbSnapshot = await get(rtdbUserRef);
          
          if (rtdbSnapshot.exists()) {
            setRecipientData({
              id: userId,
              name: name || rtdbSnapshot.val().fullName || 'User',
              profilePhoto: rtdbSnapshot.val().profilePhoto || null
            });
          } else {
            setRecipientData({
              id: userId,
              name: name || 'User',
              profilePhoto: null
            });
          }
        }
      } catch (error) {
        console.error('Error fetching recipient data:', error);
        setRecipientData({
          id: userId,
          name: name || 'User',
          profilePhoto: null
        });
      }
    };
    fetchRecipientData();
  }, [userId, name]);

  // Load messages
  useEffect(() => {
    if (!userId || !currentUser) return;

    const chatId = [currentUser.uid, userId].sort().join('_');
    const messagesRef = ref(FIREBASE_RTDB, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('createdAt'));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData = [];
      
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        const timestamp = typeof message.createdAt === 'number' ? message.createdAt : Date.now();
        
        messagesData.push({
          id: childSnapshot.key,
          ...message,
          timestamp: timestamp,
          createdAt: new Date(timestamp)
        });
      });
      
      setMessages(messagesData);
      setLoading(false);
      
      if (messagesData.length > 0 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: false });
        }, 100);
      }
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [userId, currentUser]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !userId || !currentUser) return;
    
    try {
      const chatId = [currentUser.uid, userId].sort().join('_');
      const messagesRef = ref(FIREBASE_RTDB, `chats/${chatId}/messages`);
      const newMessageRef = push(messagesRef);
      const timestamp = Date.now();
      
      const messageData = {
        text: inputMessage.trim(),
        createdAt: timestamp,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.fullName || 'User',
        receiverId: userId
      };
      
      await set(newMessageRef, messageData);

      // Send the message to the FastAPI backend for emotion prediction
      const response = await axios.post(API_URL, {
        text: inputMessage.trim()
      });

      // Get the predicted emotion from the response
      const emotion = response.data;

      // Update the message with the predicted emotion
      const emotionData = {
        ...messageData,
        emotion: emotion
      };

    // Update the message in Firebase with emotion
      await set(newMessageRef, emotionData);
        setInputMessage('');
  
      
      const lastMessageData = {
        text: inputMessage.trim(),
        emotion: emotion,
        timestamp: timestamp,
        senderId: currentUser.uid
      };
      
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

  const UserAvatar = ({ user, size = 28 }) => {
    return (
      <View style={[styles.avatarContainer, { width: size, height: size }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.5 }]}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    
    if (!item || !item.text) return null;
    
    const messageTime = formatTime(item.createdAt);
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessageContainer : styles.receivedMessageContainer
      ]}>
        {!isCurrentUser && (
          <UserAvatar user={recipientData} size={28} />
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentMessageBubble : styles.receivedMessageBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>

      {/* Display emotion only for messages received from other users */}
          {!isCurrentUser && item.emotion && (
        <Text style={styles.messageEmotion}>{item.emotion}</Text>
        )}

          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.sentMessageTime : styles.receivedMessageTime
          ]}>
            {messageTime}
          </Text>
        </View>
        
        {isCurrentUser && (
          <UserAvatar user={currentUser} size={28} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <UserAvatar user={recipientData} size={36} />
          <Text style={styles.headerName}>{recipientData?.name || name || 'User'}</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading messages...</Text>
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
        />
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline={true}
          maxHeight={100}
        />
        
        {inputMessage.trim().length > 0 && (
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sentMessageContainer: {
    justifyContent: 'flex-end',
  },
  receivedMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  avatarText: {
    color: '#555',
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  sentMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  receivedMessageBubble: {
    backgroundColor: '#ECECEC',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentMessageTime: {
    color: '#689F38',
  },
  receivedMessageTime: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
});