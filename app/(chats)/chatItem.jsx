import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { FIREBASE_RTDB, FIREBASE_DB } from '../../firebaseConfig';
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';

const ChatItem = ({ item, onPress }) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [isCurrentUserLastSender, setIsCurrentUserLastSender] = useState(false);
  const auth = FIREBASE_AUTH;

  useEffect(() => {
    if (!item?.chatId) return;

    const fetchLastMessage = async () => {
      try {
        // Get chat metadata first to check participants
        const chatRef = ref(FIREBASE_RTDB, `chats/${item.chatId}/metadata`);
        const messagesRef = ref(FIREBASE_RTDB, `chats/${item.chatId}/messages`);
        
        // Query to get the last message
        const lastMessageQuery = query(
          messagesRef,
          orderByChild('createdAt'),
          limitToLast(1)
        );

        const unsubscribe = onValue(lastMessageQuery, (snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const message = childSnapshot.val();
              setLastMessage({
                text: message.text,
                time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });
              
              // Check if current user sent the last message
              if (auth.currentUser && message.senderId === auth.currentUser.uid) {
                setIsCurrentUserLastSender(true);
              } else {
                setIsCurrentUserLastSender(false);
              }
            });
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching last message:', error);
      }
    };

    fetchLastMessage();
  }, [item.chatId]);

  return (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={onPress}
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
          {lastMessage?.time ? (
            <Text style={styles.time}>{lastMessage.time}</Text>
          ) : null}
        </View>
        
        {/* Last Message */}
        {lastMessage ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {isCurrentUserLastSender ? 'You: ' : ''}{lastMessage.text}
          </Text>
        ) : (
          <Text style={styles.noMessageText}>No messages yet</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
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
});