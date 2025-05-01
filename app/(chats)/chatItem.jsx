import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

const ChatItem = ({ item, onPress }) => {
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
          {item.time ? (
            <Text style={styles.time}>{item.time}</Text>
          ) : null}
        </View>
        
        {/* Last Message */}
        {item.lastMessage ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.isCurrentUserLastSender ? 'You: ' : ''}{item.lastMessage}
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