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
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { 
  collection, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import Home from '../home';

const ReadLogScreen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactionType, setInteractionType] = useState('All');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const filterOptions = ['All', 'Today', 'This month'];
  const interactionTypeOptions = ['All', 'Email', 'Message'];

  // Firestore Data Retrieval
  useEffect(() => {
    const logsRef = collection(FIREBASE_DB, "logs");
    const q = query(logsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        displayDate: formatDate(doc.data().createdAt?.toDate()),
        displayTime: formatTimeFromDate(doc.data().createdAt?.toDate()),
        interactionType: doc.data().interactionType || 'Message'
      }));
      
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      Alert.alert("Error", "Failed to load logs");
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Helper Functions
  const formatDate = (date) => {
    if (!date) return 'No date';
    return date.toLocaleDateString();
  };
  
  const formatTimeFromDate = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filtering Logic
  const filteredLogs = logs.filter(log => {
    const searchMatch = searchQuery === '' || 
      (log.contactName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.note || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const typeMatch = interactionType === 'All' || 
      (log.interactionType || 'Message') === interactionType;
    
    let dateMatch = true;
    if (activeTab === 'Today') {
      const today = new Date().toDateString();
      dateMatch = new Date(log.createdAt).toDateString() === today;
    } else if (activeTab === 'This month') {
      const now = new Date();
      const logDate = new Date(log.createdAt);
      dateMatch = logDate.getMonth() === now.getMonth() && 
                 logDate.getFullYear() === now.getFullYear();
    }
    
    return searchMatch && typeMatch && dateMatch;
  });

  // Delete Function
  const handleDelete = async (firestoreId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(firestoreId);
            try {
              await deleteDoc(doc(FIREBASE_DB, "logs", firestoreId));
              Alert.alert("Success", "Log deleted successfully");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete log");
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  // Navigate to Update Log Screen
  const navigateToUpdateLog = (logId) => {
    router.push({
      pathname: '/interaction-tracking-system/updateLog',
      params: { id: logId }
    });
  };

  // Render Log Item
  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.logInfo}>
        <View style={styles.logAvatar}>
          <Text style={styles.avatarText}>
            {item.contactName ? item.contactName.charAt(0).toUpperCase() : 'L'}
          </Text>
        </View>
        <View style={styles.logDetails}>
          <Text style={styles.contactName}>{item.contactName || 'No Name'}</Text>
          <Text style={styles.logNote} numberOfLines={1}>
            {item.note || 'No notes'}
          </Text>
          <View style={styles.logMeta}>
            <Text style={styles.logDate}>{item.displayDate}</Text>
            <Text style={styles.logTime}>{item.displayTime}</Text>
            <View style={[
              styles.logType,
              { 
                backgroundColor: 
                  item.interactionType === 'Email' ? '#E8F5E9' : 
                  item.interactionType === 'Message' ? '#E3F2FD' : '#F5F5F5'
              }
            ]}>
              <Text style={[
                styles.logTypeText,
                { 
                  color: 
                    item.interactionType === 'Email' ? '#4CAF50' : 
                    item.interactionType === 'Message' ? '#2196F3' : '#9E9E9E'
                }
              ]}>
                {item.interactionType}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.logActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigateToUpdateLog(item.firestoreId)}
        >
          <Ionicons name="create-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.firestoreId)}
          disabled={deletingId === item.firestoreId}
        >
          {deletingId === item.firestoreId ? (
            <ActivityIndicator size="small" color="#FF5252" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#FF5252" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Filter Buttons
  const renderFilterButtons = () => (
    <View style={styles.filterButtonsContainer}>
      {filterOptions.map(option => (
        <TouchableOpacity
          key={option}
          style={[
            styles.filterButton,
            activeTab === option && styles.activeFilterButton
          ]}
          onPress={() => setActiveTab(option)}
        >
          <Text style={[
            styles.filterButtonText,
            activeTab === option && styles.activeFilterButtonText
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2979FF" barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/home')} 
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Interaction Logs</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
        </TouchableOpacity>
      </View>
      
      {/* Search Bar Section */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterDropdown}>
          <Picker
            selectedValue={interactionType}
            onValueChange={setInteractionType}
            style={styles.picker}
            dropdownIconColor="#666"
          >
            {interactionTypeOptions.map(option => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>
        {renderFilterButtons()}
      </View>
      
      {/* Log List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2979FF" />
          <Text style={styles.emptyText}>Loading logs...</Text>
        </View>
      ) : filteredLogs.length > 0 ? (
        <FlatList
          data={filteredLogs}
          renderItem={renderItem}
          keyExtractor={item => item.firestoreId}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={<View style={styles.listHeader} />}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching logs found' : 'No logs available'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  filterSection: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterDropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  activeFilterButton: {
    backgroundColor: '#2979FF',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  listHeader: {
    height: 5,
  },
  listFooter: {
    height: 20,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  logNote: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDate: {
    color: '#999',
    fontSize: 12,
    marginRight: 10,
  },
  logTime: {
    color: '#999',
    fontSize: 12,
    marginRight: 10,
  },
  logType: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  logTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    marginTop: 10,
  },
});

export default ReadLogScreen;