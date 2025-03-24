import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

const DashboardLogScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [contacts, setContacts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter options
  const filterOptions = ['All', 'Today', 'This week', 'This month'];

  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts
      const contactsSnapshot = await getDocs(collection(FIREBASE_DB, 'contacts'));
      const contactsData = {};
      contactsSnapshot.forEach((doc) => {
        const contact = doc.data();
        contactsData[doc.id] = contact;
      });
      setContacts(contactsData);
      
      // Fetch logs
      const logsQuery = query(collection(FIREBASE_DB, 'logs'), orderBy('createdAt', 'desc'));
      const logsSnapshot = await getDocs(logsQuery);
      
      const logsData = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date if it exists
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
      
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load logs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Check for new log from params and refresh
  useEffect(() => {
    if (params.newLog) {
      fetchData();
    }
  }, [params.newLog]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    // If it's already a formatted date string like "March 20, 2025"
    if (typeof dateString === 'string' && dateString.includes(',')) {
      return dateString;
    }
    
    // Try to parse the date
    let date;
    try {
      date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as is if parsing fails
      }
    } catch (e) {
      return dateString;
    }
    
    // Format as "Month Day, Year"
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date';
    
    // Try to parse the date
    let date;
    try {
      date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as is if parsing fails
      }
    } catch (e) {
      return dateString;
    }
    
    // Format as "Month Day, Year at HH:MM AM/PM"
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
    
    return `${formattedDate} at ${formattedTime}`;
  };

  // Get the current date at midnight for comparison
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Get the start of the current week (Sunday)
  const getWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const diff = today.getDate() - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Get the start of the current month
  const getMonthStart = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    return monthStart;
  };

  // Filter logs based on activeTab and searchQuery
  const getFilteredLogs = () => {
    return logs.filter(log => {
      const contactName = log.contactName || '';
      const note = log.note || '';
      
      // Apply search filter
      const matchesSearch = searchQuery === '' || 
        contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Apply tab filters
      if (activeTab === 'All') return true;
      
      // Parse log date
      let logDate;
      
      if (log.date) {
        if (typeof log.date === 'string') {
          try {
            // Try to parse the date string
            logDate = new Date(log.date);
            if (isNaN(logDate.getTime())) {
              // If string parsing fails, fall back to createdAt
              logDate = log.createdAt || new Date();
            }
          } catch (e) {
            logDate = log.createdAt || new Date();
          }
        } else {
          // If it's already a Date object
          logDate = log.date;
        }
      } else {
        // Fallback to createdAt if date is not available
        logDate = log.createdAt || new Date();
      }
      
      // Set time to midnight for comparison
      const logDay = new Date(logDate);
      logDay.setHours(0, 0, 0, 0);
      
      // Apply tab filters
      if (activeTab === 'Today') {
        return logDay.getTime() === getTodayStart().getTime();
      } else if (activeTab === 'This week') {
        return logDay >= getWeekStart();
      } else if (activeTab === 'This month') {
        return logDay >= getMonthStart();
      }
      
      return true;
    });
  };

  const filteredLogs = getFilteredLogs();

  // Handle log deletion
  const handleDeleteLog = (logId) => {
    Alert.alert(
      "Delete Log",
      "Are you sure you want to delete this log?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(FIREBASE_DB, 'logs', logId));
              // Update state to remove the deleted log
              setLogs(logs.filter(log => log.id !== logId));
              Alert.alert("Success", "Log deleted successfully");
            } catch (error) {
              console.error("Error deleting log:", error);
              Alert.alert("Error", "Failed to delete log. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Navigate to edit log screen
  const handleEditLog = (log) => {
    router.push({
      pathname: '/EditLogScreen',
      params: { logId: log.id }
    });
  };

  // Navigate to add new log screen
  const handleAddNewLog = () => {
    router.push('/NewLogScreen');
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{item.contactName || 'Unknown Contact'}</Text>
          <Text style={styles.timeText}>{formatDateTime(item.date || item.createdAt)}</Text>
        </View>

        <Text style={styles.messageText} numberOfLines={2}>
          {item.note || 'No notes'}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{item.interactionType || 'Other'}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleEditLog(item)}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleDeleteLog(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const handleCancelSearch = () => {
    setSearchQuery('');
  };

  // Render empty state
  const renderEmptyComponent = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>No logs found</Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 'Try a different search term' : 'Add your first interaction log'}
        </Text>
        {!searchQuery && (
          <TouchableOpacity style={styles.addLogButton} onPress={handleAddNewLog}>
            <Text style={styles.addLogButtonText}>Add New Log</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Interaction Logs</Text>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewLog}>
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or note"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8e8e93"
            clearButtonMode="while-editing"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={handleCancelSearch}>
              <Ionicons name="close-circle" size={18} color="#8e8e93" style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
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
        </ScrollView>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {/* Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredLogs.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyComponent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  addButton: {
    padding: 4,
    width: 32,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9eb',
    borderRadius: 10,
    paddingHorizontal: 10,
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
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tabScrollContainer: {
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  messageText: {
    fontSize: 14,
    color: '#3c3c43',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    backgroundColor: '#E5F1FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
  addLogButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addLogButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardLogScreen;