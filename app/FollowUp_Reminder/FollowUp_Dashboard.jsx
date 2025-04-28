import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

const FollowUpDashboard = () => {
  const router = useRouter();
  const { newReminder } = useLocalSearchParams(); // Grab param from navigation

  const [searchText, setSearchText] = useState('');
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'overdue', 'upcoming'
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority', 'assignedTo'

  // Stats for dashboard
  const [stats, setStats] = useState({
    todayCount: 0,
    overdueCount: 0,
    upcomingCount: 0,
    highPriorityCount: 0
  });

  // Fetch reminders from Firestore
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const q = query(collection(FIREBASE_DB, 'reminders'), orderBy('dueDate'));
        const querySnapshot = await getDocs(q);
        const fetchedReminders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setReminders(fetchedReminders);
        applyFiltersAndSort(fetchedReminders, filter, sortBy, searchText);
        calculateStats(fetchedReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }
    };

    fetchReminders();
  }, []);

  // Add the passed reminder when screen opens
  useEffect(() => {
    if (newReminder) {
      try {
        const parsed = JSON.parse(newReminder);
        setReminders((prev) => {
          const updated = [parsed, ...prev];
          applyFiltersAndSort(updated, filter, sortBy, searchText);
          calculateStats(updated);
          return updated;
        });
      } catch (e) {
        console.error('Failed to parse reminder:', e);
      }
    }
  }, [newReminder]);

  // Calculate dashboard stats
  const calculateStats = (remindersList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().split('T')[0];
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    
    const todayItems = remindersList.filter(item => item.dueDate === todayStr);
    const overdueItems = remindersList.filter(item => {
      return new Date(item.dueDate) < today;
    });
    const upcomingItems = remindersList.filter(item => {
      const dueDate = new Date(item.dueDate);
      return dueDate > today && dueDate <= weekLater;
    });
    const highPriorityItems = remindersList.filter(item => 
      item.status === 'Urgent' || item.status === 'High'
    );

    setStats({
      todayCount: todayItems.length,
      overdueCount: overdueItems.length,
      upcomingCount: upcomingItems.length,
      highPriorityCount: highPriorityItems.length
    });
  };

  // Apply filters, search, and sort to reminders
  const applyFiltersAndSort = (remindersList, activeFilter, activeSortBy, searchQuery) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().split('T')[0];
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    
    // First apply filter
    let filtered = remindersList;
    if (activeFilter === 'today') {
      filtered = remindersList.filter(item => item.dueDate === todayStr);
    } else if (activeFilter === 'overdue') {
      filtered = remindersList.filter(item => new Date(item.dueDate) < today);
    } else if (activeFilter === 'upcoming') {
      filtered = remindersList.filter(item => {
        const dueDate = new Date(item.dueDate);
        return dueDate > today && dueDate <= weekLater;
      });
    } else if (activeFilter === 'highPriority') {
      filtered = remindersList.filter(item => 
        item.status === 'Urgent' || item.status === 'High'
      );
    }
    
    // Then apply search
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item => 
        item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.contact && item.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Finally apply sort
    if (activeSortBy === 'dueDate') {
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (activeSortBy === 'priority') {
      const priorityOrder = { 'Urgent': 0, 'High': 1, 'Normal': 2, 'Low': 3 };
      filtered.sort((a, b) => priorityOrder[a.status] - priorityOrder[b.status]);
    } else if (activeSortBy === 'assignedTo') {
      filtered.sort((a, b) => (a.assignedTo || '').localeCompare(b.assignedTo || ''));
    }
    
    setFilteredReminders(filtered);
  };

  // Handle searching
  const handleSearch = (text) => {
    setSearchText(text);
    applyFiltersAndSort(reminders, filter, sortBy, text);
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFiltersAndSort(reminders, newFilter, sortBy, searchText);
  };
  
  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    applyFiltersAndSort(reminders, filter, newSortBy, searchText);
  };

  const handleDoneReminder = (id) => {
    setReminders((prev) => {
      const updated = prev.filter(item => item.id !== id);
      applyFiltersAndSort(updated, filter, sortBy, searchText);
      calculateStats(updated);
      return updated;
    });
  };

  const handleEditReminder = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/EditForm',
      params: { id },
    });
  };

  const handleDeleteReminder = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/Delete_FollowUp',
      params: { id },
    });
  };

  const handleCreateReminder = () => {
    router.push('/FollowUp_Reminder/Create_FollowUp');
  };

  const handleGenerateReport = () => {
    // This would typically generate a report
    alert('Report generation feature will be implemented soon');
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return styles.urgentTag;
      case 'High':
        return styles.highTag;
      case 'Normal':
        return styles.normalTag;
      case 'Low':
        return styles.lowTag;
      default:
        return styles.normalTag;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.headerText}>Follow-Up Reminder Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reminders"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
        </View>
        
        {/* Filter and Sort Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={() => {
            // Toggle between filters
            const filters = ['all', 'today', 'overdue', 'upcoming', 'highPriority'];
            const nextIndex = (filters.indexOf(filter) + 1) % filters.length;
            handleFilterChange(filters[nextIndex]);
          }}>
            <Ionicons name="filter" size={16} color="#555" />
            <Text style={styles.buttonText}>
              {filter === 'all' ? 'All' : 
               filter === 'today' ? 'Today' : 
               filter === 'overdue' ? 'Overdue' :
               filter === 'upcoming' ? 'Upcoming' : 'High Priority'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sortButton} onPress={() => {
            // Toggle between sort options
            const sortOptions = ['dueDate', 'priority', 'assignedTo'];
            const nextIndex = (sortOptions.indexOf(sortBy) + 1) % sortOptions.length;
            handleSortChange(sortOptions[nextIndex]);
          }}>
            <Ionicons name="swap-vertical" size={16} color="#555" />
            <Text style={styles.buttonText}>
              {sortBy === 'dueDate' ? 'By Date' : 
               sortBy === 'priority' ? 'By Priority' : 'By Assignee'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, styles.todayCard]}>
            <Text style={styles.statsTitle}>Today's Follow-Ups</Text>
            <Text style={styles.statsNumber}>{stats.todayCount}</Text>
            <Text style={styles.statsSubtext}>
              {stats.highPriorityCount > 0 ? `${stats.highPriorityCount} High Priority` : 'No urgent tasks'}
            </Text>
          </View>
          
          <View style={[styles.statsCard, styles.overdueCard]}>
            <Text style={styles.statsTitle}>Overdue Tasks</Text>
            <Text style={styles.statsNumber}>{stats.overdueCount}</Text>
            <Text style={styles.statsSubtext}>Action Required</Text>
          </View>
          
          <View style={[styles.statsCard, styles.upcomingCard]}>
            <Text style={styles.statsTitle}>Upcoming</Text>
            <Text style={styles.statsNumber}>{stats.upcomingCount}</Text>
            <Text style={styles.statsSubtext}>(7 Days)</Text>
          </View>
        </View>

        {/* Priority Tasks List */}
        <Text style={styles.sectionTitle}>Priority Tasks</Text>
        
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#999" />
            <Text style={styles.emptyStateText}>No reminders found</Text>
            <Text style={styles.emptyStateSubtext}>Try changing your filters or create a new reminder</Text>
          </View>
        ) : (
          filteredReminders.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.task}</Text>
                <View style={[styles.statusTag, getPriorityStyle(item.status)]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.detailLabel}>Contact:</Text>
                <Text style={styles.detailText}>{item.contact || 'N/A'}</Text>
              </View>
              
              <View style={styles.cardDetails}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailText}>{item.dueDate}</Text>
              </View>
              
              <View style={styles.cardDetails}>
                <Text style={styles.detailLabel}>Assigned To:</Text>
                <Text style={styles.detailText}>{item.assignedTo}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.doneBtn} 
                  onPress={() => handleDoneReminder(item.id)}
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.editBtn} 
                  onPress={() => handleEditReminder(item.id)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDeleteReminder(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.reportBtn} onPress={handleGenerateReport}>
          <Text style={styles.reportBtnText}>Generate Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateReminder}>
          <Text style={styles.addBtnText}>+ New Reminder</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FollowUpDashboard;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    alignItems: 'center',
    elevation: 2,
  },
  headerText: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#333'
  },
  scrollContent: { 
    padding: 12,
    paddingBottom: 80 // Space for bottom buttons
  },
  searchContainer: { 
    marginBottom: 15 
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    elevation: 2,
    borderLeftWidth: 4,
  },
  todayCard: {
    borderLeftColor: '#4caf50',
  },
  overdueCard: {
    borderLeftColor: '#f44336',
  },
  upcomingCard: {
    borderLeftColor: '#2196f3',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsSubtext: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  urgentTag: {
    backgroundColor: '#f44336',
  },
  highTag: {
    backgroundColor: '#ff9800',
  },
  normalTag: {
    backgroundColor: '#2196f3',
  },
  lowTag: {
    backgroundColor: '#9e9e9e',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  doneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4caf50',
    borderRadius: 4,
    marginRight: 8,
  },
  doneBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2196f3',
    borderRadius: 4,
    marginRight: 8,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  bottomActions: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    padding: 12,
  },
  reportBtn: {
    flex: 1,
    backgroundColor: '#8bc34a',
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  reportBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777',
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});