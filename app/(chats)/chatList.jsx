import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

const ChatList = () => {
  // Navigation function to go to chat room
  const navigateToChatRoom = (item) => {
    router.push({
      pathname: '/chatRoom',
      params: {
        id: item.id,
        name: item.name,
        avatar: item.avatar
      }
    });
  };

  // Sample data for chat list
  const chats = [
    {
      id: '1',
      name: 'Norm',
      lastMessage: 'Last message',
      time: 'Time',
      avatar: 'https://via.placeholder.com/40',
      isUnread: true,
    },
    {
      id: '2',
      name: 'John snow',
      lastMessage: 'Last message',
      time: 'Time',
      avatar: 'https://via.placeholder.com/40',
      isUnread: false,
    },
  ];

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigateToChatRoom(item)}
    >
      <Image
        source={{ uri: item.avatar }}
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <View style={styles.nameTimeContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://via.placeholder.com/30' }}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        style={styles.chatList}
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
  header: {
    backgroundColor: '#2979FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
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
});