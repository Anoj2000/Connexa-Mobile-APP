
//update
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const chat = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Sample chat data
  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      lastMessage: 'Hey, how are you doing?',
      time: '2 min ago',
      unread: 3,
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      online: true,
    },
    {
      id: '2',
      name: 'Sarah Williams',
      lastMessage: 'The party starts at 8pm!',
      time: '1 hr ago',
      unread: 0,
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      online: false,
    },
    {
      id: '3',
      name: 'Tech Group',
      lastMessage: 'Mike: I found a solution to the bug',
      time: '3 hrs ago',
      unread: 5,
      avatar: 'https://randomuser.me/api/portraits/lego/3.jpg',
      isGroup: true,
    },
    {
      id: '4',
      name: 'David Miller',
      lastMessage: 'Let me know when you finish the design',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      online: true,
    },
    {
      id: '4',
      name: 'David Miller',
      lastMessage: 'Let me know when you finish the design',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      online: true,
    },
  ]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chat: item })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineBadge} />}
        {item.isGroup && (
          <View style={styles.groupBadge}>
            <Ionicons name="people" size={14} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text 
          style={[
            styles.chatMessage,
            item.unread > 0 && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6e3b6e" />
      </View>
    );
  }

}

export default chat

