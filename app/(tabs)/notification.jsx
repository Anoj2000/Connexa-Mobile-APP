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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="notifications-off" size={24} color="#075E54" />
            <Text style={styles.settingText}>Mute all notifications</Text>
          </View>
          <Switch
            trackColor={{ false: "#D3D3D3", true: "#128C7E" }}
            thumbColor={muteAll ? "#FFFFFF" : "#FFFFFF"}
            onValueChange={() => setMuteAll(prevState => !prevState)}
            value={muteAll}
          />
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <View style={styles.notificationList}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Recent notifications</Text>
          <TouchableOpacity>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* No Notifications View (hidden when there are notifications) */}
      {notifications.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-none" size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>
            When you get notifications, they'll show up here
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2979FF',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  settingsSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
  },
  notificationList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#075E54',
  },
  clearAllText: {
    color: '#075E54',
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  unreadNotification: {
    backgroundColor: '#E8F5E9',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E8E',
  },
  notificationBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconContainer: {
    marginRight: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#505050',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 15,
    color: '#555555',
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E8E8E',
    textAlign: 'center',
    marginTop: 10,
  },
});