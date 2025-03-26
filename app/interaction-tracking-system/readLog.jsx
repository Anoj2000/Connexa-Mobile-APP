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
  Alert,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

// Responsive Design Constants
const { width, height } = Dimensions.get('window');

// Color Palette
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  white: '#FFFFFF',
  gray: '#8E8E93',
  black: '#000000',
  red: '#FF3B30',
  lightGray: '#E5E5E5'
};

const DashboardLogScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactionType, setInteractionType] = useState('All');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const filterOptions = ['All', 'Today', 'This month'];
  const interactionTypeOptions = ['All', 'Email', 'Message'];

  // Delete Function with correct ID format
  const handleDelete = async (logId) => {
    try {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this log?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setDeletingId(logId);
              try {
                // Using the correct document reference format
                const logRef = doc(FIREBASE_DB, "logs", logId);
                
                // Verify document exists
                const docSnap = await getDoc(logRef);
                if (!docSnap.exists()) {
                  Alert.alert("Error", "Log not found or already deleted.");
                  return;
                }
                
                await deleteDoc(logRef);
                
                // Optimistic update
                setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
                
                Alert.alert(
                  "Success", 
                  "Log deleted successfully",
                  [{ text: "OK" }]
                );
              } catch (error) {
                console.error("Delete error:", error);
                Alert.alert(
                  "Error", 
                  "Failed to delete log. Please try again.",
                  [{ text: "OK" }]
                );
              } finally {
                setDeletingId(null);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Alert error:", error);
      setDeletingId(null);
    }
  };

  // Firestore Data Retrieval
  useEffect(() => {
    const logsRef = collection(FIREBASE_DB, "logs");
    const q = query(logsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id, // This will use the correct ID format (like "7x2bbzNQ1HSjnoJRj5Lo")
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        displayDate: doc.data().date || formatDate(doc.data().createdAt?.toDate()),
        displayTime: doc.data().time || formatTimeFromDate(doc.data().createdAt?.toDate()),
        interactionType: doc.data().interactionType || 'Other'
      }));
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
      Alert.alert("Error", "Unable to load logs. Please try again.");
    });

    return () => unsubscribe();
  }, []);

  // Helper Functions
  const formatDate = (date) => date?.toLocaleDateString() || 'No date';
  const formatTimeFromDate = (date) => date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

  // Filtering Logic
  const filteredLogs = logs.filter(log => {
    const searchMatch = searchQuery === '' || 
      (log.contactName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.note || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const typeMatch = interactionType === 'All' || 
      (log.interactionType || 'Other') === interactionType;
    
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

  // Render Log Item
  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.contactName} numberOfLines={1}>
          {item.contactName || 'No Name'}
        </Text>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{item.displayDate}</Text>
          <Text style={styles.timeText}>{item.displayTime}</Text>
        </View>
      </View>
      
      <Text style={styles.noteText} numberOfLines={3}>
        {item.note || 'No notes'}
      </Text>
      
      <View style={styles.logFooter}>
        <View style={[
          styles.typeBadge,
          { 
            backgroundColor: item.interactionType === 'Email' 
              ? 'rgba(0, 122, 255, 0.1)' 
              : 'rgba(142, 142, 147, 0.1)' 
          }
        ]}>
          <Text style={[
            styles.typeText,
            { 
              color: item.interactionType === 'Email' 
                ? COLORS.primary 
                : COLORS.gray 
            }
          ]}>
            {item.interactionType}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => router.push(`/EditLogScreen?id=${item.id}`)}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
            style={styles.actionButton}
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.red} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={COLORS.red} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.background} 
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Interaction Logs</Text>
        <TouchableOpacity onPress={() => router.push('/NewLogScreen')}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={interactionType}
            onValueChange={setInteractionType}
            style={styles.dropdown}
          >
            {interactionTypeOptions.map(option => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.tabButton,
                activeTab === option && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(option)}
            >
              <Text style={[
                styles.tabText,
                activeTab === option && styles.activeTabText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>No logs found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try a different search' : 'Add your first log'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

// Styles remain exactly the same as in the previous code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      }
    })
  },
  title: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: COLORS.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.015,
    margin: width * 0.04,
    marginBottom: height * 0.02,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      }
    })
  },
  searchIcon: {
    marginRight: width * 0.02,
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    color: COLORS.black,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  dropdownContainer: {
    flex: 1,
    paddingLeft: width * 0.04,
  },
  dropdown: {
    height: height * 0.06,
    width: '100%',
  },
  tabButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    marginRight: width * 0.02,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: width * 0.035,
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: width * 0.04,
    paddingBottom: height * 0.06,
  },
  logItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      }
    })
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
    alignItems: 'center',
  },
  contactName: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: COLORS.black,
    flex: 1,
    marginRight: width * 0.02,
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: width * 0.033,
    color: COLORS.gray,
  },
  timeText: {
    fontSize: width * 0.03,
    color: COLORS.gray,
    marginTop: 2,
  },
  noteText: {
    fontSize: width * 0.035,
    color: '#3C3C43',
    marginBottom: height * 0.015,
    lineHeight: height * 0.025,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.005,
    borderRadius: 6,
  },
  typeText: {
    fontSize: width * 0.03,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: width * 0.04,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.1,
  },
  emptyTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },
  emptyText: {
    fontSize: width * 0.035,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: height * 0.06,
  },
});

export default DashboardLogScreen;