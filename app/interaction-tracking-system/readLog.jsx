import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Sample data to use when no logs are provided through navigation
const SAMPLE_LOGS = [
  {
    id: '1',
    contactName: 'John Doe',
    date: '2025-03-20',
    note: 'Discussed project timeline and deliverables',
    interactionType: 'Meeting'
  },
  {
    id: '2',
    contactName: 'Jane Smith',
    date: '2025-03-21',
    note: 'Follow-up call about requirements',
    interactionType: 'Call'
  }
];

const DashboardLogScreen = ({ navigation, route = {} }) => {
  const [activeTab, setActiveTab] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState(SAMPLE_LOGS);

  // Safely access route.params and set logs if available
  useEffect(() => {
    if (route && route.params && route.params.logs) {
      setLogs(route.params.logs);
    }
  }, [route]);

  // Filter logs based on activeTab and searchQuery
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.note && log.note.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Apply tab filters
    if (activeTab === 'All') return true;
    
    // Safely parse date
    let logDate;
    try {
      logDate = new Date(log.date);
      if (isNaN(logDate.getTime())) {
        // If date is invalid, fallback to current date
        logDate = new Date();
      }
    } catch (e) {
      logDate = new Date();
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === 'Today') {
      const logDay = new Date(logDate);
      logDay.setHours(0, 0, 0, 0);
      return logDay.getTime() === today.getTime();
    }
    
    if (activeTab === 'This week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return logDate >= weekStart;
    }
    
    return true;
  });

  // Filter options
  const filterOptions = ['All', 'Today', 'This week'];

  const renderLogItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{item.contactName || 'Unknown Contact'}</Text>
          <Text style={styles.timeText}>{item.date || 'No date'}</Text>
        </View>

        <Text style={styles.messageText} numberOfLines={2}>
          {item.note || 'No notes'}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.typeText}>{item.interactionType || 'Other'}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Edit log', item.id)}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Delete log', item.id)}>
              <Ionicons name="trash-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const handleCancelSearch = () => {
    setSearchQuery('');
  };

  // Handle back navigation safely
  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
          {searchQuery !== '' && (
            <TouchableOpacity onPress={handleCancelSearch}>
              <Ionicons name="close-circle" size={18} color="#8e8e93" style={styles.clearIcon} />
            </TouchableOpacity>
          )}
          <Ionicons name="mic" size={18} color="#8e8e93" style={styles.micIcon} />
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSearch}>
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
              activeTab === option && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(option)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === option && styles.activeTabText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No logs found</Text>
          </View>
        }
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
  clearIcon: {
    marginLeft: 6,
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
  listContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
  },
});

export default DashboardLogScreen;