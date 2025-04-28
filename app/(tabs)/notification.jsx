
//update
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity,
  StatusBar,
  Switch
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const NotificationScreen = () => {
  const [muteAll, setMuteAll] = useState(false);
  
  // Sample notification data
  const notifications = [
    {
      id: '1',
      type: 'message',
      sender: 'John Smith',
      content: 'sent you a message',
      time: '2 min ago',
      read: false,
      avatar: 'https://via.placeholder.com/50'
    },
    {
      id: '2',
      type: 'group',
      sender: 'Family Group',
      content: 'Sarah added you to this group',
      time: '10 min ago',
      read: false,
      avatar: 'https://via.placeholder.com/50'
    },
    {
      id: '3',
      type: 'call',
      sender: 'Jessica Lee',
      content: 'Missed voice call',
      time: '1 hour ago',
      read: true,
      avatar: 'https://via.placeholder.com/50'
    },
    {
      id: '4',
      type: 'message',
      sender: 'Mike Johnson',
      content: 'mentioned you in Work Group',
      time: '3 hours ago',
      read: true,
      avatar: 'https://via.placeholder.com/50'
    },
    {
      id: '5',
      type: 'media',
      sender: 'David Wilson',
      content: 'sent you a photo',
      time: 'Yesterday',
      read: true,
      avatar: 'https://via.placeholder.com/50'
    },
    {
      id: '6',
      type: 'status',
      sender: 'Emma Thompson',
      content: 'updated her status',
      time: 'Yesterday',
      read: true,
      avatar: 'https://via.placeholder.com/50'
    },
  ];

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'message':
        return <MaterialIcons name="chat" size={20} color="#075E54" />;
      case 'group':
        return <MaterialIcons name="group" size={20} color="#075E54" />;
      case 'call':
        return <MaterialIcons name="call-missed" size={20} color="#FF0000" />;
      case 'media':
        return <MaterialIcons name="photo" size={20} color="#075E54" />;
      case 'status':
        return <MaterialIcons name="remove-red-eye" size={20} color="#075E54" />;
      default:
        return <MaterialIcons name="notifications" size={20} color="#075E54" />;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadNotification]}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.notificationBody}>
          <View style={styles.notificationIconContainer}>
            {getNotificationIcon(item.type)}
          </View>
          <Text style={styles.contentText}>{item.content}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
