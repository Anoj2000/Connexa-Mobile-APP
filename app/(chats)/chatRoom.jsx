import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ChatRoom = () => {
  // Get route params
  const params = useLocalSearchParams();
  const { name, avatar } = params;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'How are You ?',
      time: '10:00',
      sent: true,
      emoji: '🤠'
    },
    {
      id: '2',
      text: 'I am fine',
      time: '12:35',
      sent: false,
      emoji: '😊'
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.profileSection}>
          <Image
            source={{ uri: avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{name || 'User'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.videoButton}>
          <Ionicons name="videocam" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      {/* Messages Area */}
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map(msg => (
          <View key={msg.id} style={[
            styles.messageWrapper,
            msg.sent ? styles.sentWrapper : styles.receivedWrapper
          ]}>
            {!msg.sent && (
              <Image
                source={{ uri: avatar || 'https://via.placeholder.com/40' }}
                style={styles.messageAvatar}
              />
            )}
            
            <View style={[
              styles.message,
              msg.sent ? styles.sentMessage : styles.receivedMessage
            ]}>
              <Text style={[
                styles.messageText,
                msg.sent ? styles.sentMessageText : styles.receivedMessageText
              ]}>
                {msg.text}
              </Text>
            </View>
            
            {msg.sent && msg.emoji && (
              <Text style={styles.emoji}>{msg.emoji}</Text>
            )}
            
            <Text style={[
              styles.timestamp,
              msg.sent ? styles.sentTimestamp : styles.receivedTimestamp
            ]}>
              {msg.time}
            </Text>
            
            {!msg.sent && msg.emoji && (
              <Text style={styles.emoji}>{msg.emoji}</Text>
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.plusButton}>
          <Ionicons name="add" size={24} color="#8E8E93" />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Text Message + RCS"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={message.trim() ? "#007AFF" : "#C7C7CC"} 
          />
        </TouchableOpacity>
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    marginRight: 4,
  },
  videoButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sentWrapper: {
    alignSelf: 'flex-end',
  },
  receivedWrapper: {
    alignSelf: 'flex-start',
  },
  message: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 4,
  },
  sentMessage: {
    backgroundColor: '#34D399', // Green color as in image
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: '#000',
    fontWeight: '500',
  },
  receivedMessageText: {
    color: '#000',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginHorizontal: 4,
  },
  sentTimestamp: {
    alignSelf: 'flex-end',
  },
  receivedTimestamp: {
    alignSelf: 'flex-start',
  },
  emoji: {
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  plusButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  micButton: {
    padding: 4,
  },
  sendButton: {
    padding: 8,
  },
});