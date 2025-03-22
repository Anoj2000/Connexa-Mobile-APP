import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FollowUpDashboard = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Due Date');

  // Mock data for the dashboard
  const dashboardStats = {
    todaysFollowUps: 5,
    highPriorityToday: 2,
    overdueTasks: 3,
    upcomingTasks: 8,
    upcomingTeamMembers: 3
  };

  // Mock data for reminders
  const [reminders, setReminders] = useState([
    {
      id: '1',
      contact: 'Acme Corp',
      task: 'Contract Renewal',
      dueDate: 'Feb 24',
      assignedTo: 'You',
      status: 'Urgent',
    },
    {
      id: '2',
      contact: 'Tech Start',
      task: 'Software Demo',
      dueDate: 'March 2',
      assignedTo: 'Jane Smith',
      status: 'Normal',
    }
  ]);

  // Navigate to create new reminder page
  const handleNewReminder = () => {
    router.push('/FollowUp_Reminder/Create_FollowUp');
  };

  // Navigate to edit reminder page
  const handleEditReminder = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/Edit_FollowUp',
      params: { id }
    });
  };

  // Show delete confirmation
  const handleDeleteReminder = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/Delete_FollowUp',
      params: { id }
    });
  };

  // Handle marking a reminder as done
  const handleDoneReminder = (id) => {
    // Update the reminder status in your data store
    // This is just a mock implementation
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
  };

  // Handle generating report (placeholder)
  const handleGenerateReport = () => {
    alert('Report generation functionality will be implemented here');
  };

  // Render a dashboard card
  const RenderCard = ({ title, count, subtitle }) => (
    <View style={styles.dashboardCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardCount}>{count}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );

  // Render a reminder item
  const renderReminderItem = ({ item }) => (
    <View style={styles.reminderItem}>
      <View style={styles.reminderHeader}>
        <Text style={styles.reminderHeaderText}>Priority Tasks</Text>
      </View>
      <View style={styles.reminderContent}>
        <View style={styles.reminderRow}>
          <Text style={[styles.columnHeader, styles.contactColumn]}>Contact</Text>
          <Text style={[styles.columnHeader, styles.taskColumn]}>Tasks</Text>
          <Text style={[styles.columnHeader, styles.dateColumn]}>Due Date</Text>
          <Text style={[styles.columnHeader, styles.assignedColumn]}>Assigned To</Text>
          <Text style={[styles.columnHeader, styles.statusColumn]}>Status</Text>
        </View>
        
        <View style={styles.reminderRow}>
          <Text style={[styles.reminderText, styles.contactColumn]}>{item.contact}</Text>
          <Text style={[styles.reminderText, styles.taskColumn]}>{item.task}</Text>
          <Text style={[styles.reminderText, styles.dateColumn]}>{item.dueDate}</Text>
          <Text style={[styles.reminderText, styles.assignedColumn]}>{item.assignedTo}</Text>
          <View style={[styles.statusBadge, item.status === 'Urgent' ? styles.urgentBadge : styles.normalBadge]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.doneButton]} 
            onPress={() => handleDoneReminder(item.id)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEditReminder(item.id)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDeleteReminder(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Follow-Up Reminder Dashboard</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reminders"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          
          <View style={styles.filtersContainer}>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Filter</Text>
              <Ionicons name="chevron-down" size={16} color="#333" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Sort By</Text>
              <Ionicons name="chevron-down" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Dashboard Stats */}
        <View style={styles.dashboardStatsContainer}>
          <RenderCard 
            title="Today's Follow-Ups" 
            count={dashboardStats.todaysFollowUps} 
            subtitle={`${dashboardStats.highPriorityToday} High Priority`} 
          />
          <RenderCard 
            title="Overdue Tasks" 
            count={dashboardStats.overdueTasks} 
            subtitle="Action Required" 
          />
          <RenderCard 
            title="Upcoming (7 Days)" 
            count={dashboardStats.upcomingTasks} 
            subtitle={`${dashboardStats.upcomingTeamMembers} Team Members`} 
          />
        </View>
        
        {/* Reminders List */}
        <View style={styles.remindersContainer}>
          {reminders.map(item => renderReminderItem({ item }))}
        </View>
        
        {/* Bottom Action Buttons */}
        <View style={styles.bottomActionContainer}>
          <TouchableOpacity 
            style={[styles.bottomActionButton, styles.reportButton]}
            onPress={handleGenerateReport}
          >
            <Text style={styles.bottomActionButtonText}>Generate Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bottomActionButton, styles.newReminderButton]}
            onPress={handleNewReminder}
          >
            <Text style={styles.bottomActionButtonText}>+ New Reminder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FollowUpDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 12,
  },
  
  // Search and Filters
  searchContainer: {
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 8,
    width: '48%',
    justifyContent: 'space-between',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  
  // Dashboard Stats
  dashboardStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 10,
    width: '32%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardCount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Reminders
  remindersContainer: {
    marginBottom: 15,
  },
  reminderItem: {
    backgroundColor: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  reminderHeader: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  reminderHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  reminderContent: {
    padding: 10,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  reminderText: {
    fontSize: 14,
    color: '#333',
  },
  contactColumn: {
    width: '20%',
  },
  taskColumn: {
    width: '20%',
  },
  dateColumn: {
    width: '20%',
  },
  assignedColumn: {
    width: '20%',
  },
  statusColumn: {
    width: '20%',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
  },
  urgentBadge: {
    backgroundColor: '#dc3545',
  },
  normalBadge: {
    backgroundColor: '#007bff',
  },
  statusText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  doneButtonText: {
    color: '#333',
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButtonText: {
    color: '#fff',
  },
  
  // Bottom Action Buttons
  bottomActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomActionButton: {
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    width: '48%',
  },
  reportButton: {
    backgroundColor: '#8BC34A',
  },
  newReminderButton: {
    backgroundColor: '#007bff',
  },
  bottomActionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  }
});