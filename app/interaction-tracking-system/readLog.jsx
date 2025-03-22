import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationLogScreen = ({ navigation, notifications = [] }) => {
  const [activeTab, setActiveTab] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter options
  const filterOptions = ['All', 'Today', 'This week'];

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
        <View style={[styles.statusIndicator, { backgroundColor: item.statusColor }]} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        
        <Text style={styles.messageText} numberOfLines={1}>
          {item.message}
        </Text>
        
        <View style={styles.footerRow}>
          <Text style={styles.typeText}>{item.type}-{item.timestamp}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8e8e93"
          />
          <Ionicons name="mic" size={18} color="#8e8e93" style={styles.micIcon} />
        </View>
        
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.tabButton,
              activeTab === option && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(option)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === option && styles.activeTabText,
                option === 'This week' && styles.thisWeekTab
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingTop:50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9eb',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
    color: '#000',
  },
  micIcon: {
    marginLeft: 6,
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  thisWeekTab: {
    color: '#007AFF',
  },
  listContainer: {
    paddingTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  messageText: {
    fontSize: 14,
    color: '#3c3c43',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 8,
    opacity: 0.2,
  },
});

export default NotificationLogScreen;
