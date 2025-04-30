import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Reminder_Summary = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const snapshot = await getDocs(collection(FIREBASE_DB, 'reminders'));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReminders(list);
        generateMonthlyReport(list);
      } catch (err) {
        console.error('Error fetching reminders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const generateMonthlyReport = (reminderList) => {
    // Group tasks by month
    const report = {};
    reminderList.forEach(reminder => {
      if (!reminder.dueDate) return;
      
      const month = reminder.dueDate.substring(0, 7); // Get YYYY-MM
      if (!report[month]) {
        report[month] = {
          total: 0,
          completed: 0,
          urgent: 0,
          normal: 0,
          overdue: 0,
          byAssignee: {}
        };
      }
      
      report[month].total++;
      
      if (reminder.completed) {
        report[month].completed++;
      }
      
      if (reminder.status === 'Urgent') {
        report[month].urgent++;
      } else if (reminder.status === 'Normal') {
        report[month].normal++;
      }
      
      if (reminder.dueDate < getCurrentDate()) {
        report[month].overdue++;
      }
      
      // Count by assignee
      const assignee = reminder.assignedTo || 'Unassigned';
      if (!report[month].byAssignee[assignee]) {
        report[month].byAssignee[assignee] = 0;
      }
      report[month].byAssignee[assignee]++;
    });
    
    setMonthlyReport(report);
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const getDateDaysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // Filter reminders based on search query and selected category
  const filteredReminders = reminders.filter((item) => {
    const matchesSearch = 
      item.task?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    switch (selectedCategory) {
      case 'today':
        return item.dueDate === getCurrentDate();
      case 'overdue':
        return item.dueDate < getCurrentDate();
      case 'upcoming':
        return item.dueDate > getCurrentDate() && item.dueDate <= getDateDaysFromNow(7);
      default:
        return true; // 'all' category
    }
  });

  // Filter for today's follow-ups
  const todaysFollowUps = reminders.filter((item) => {
    return item.dueDate === getCurrentDate();
  });

  // Filter for high priority tasks in today's follow-ups
  const highPriorityToday = todaysFollowUps.filter((item) => {
    return item.status === 'Urgent';
  });

  // Filter for overdue tasks
  const overdueTasks = reminders.filter((item) => {
    return item.dueDate < getCurrentDate();
  });

  // Filter for upcoming tasks in the next 7 days
  const upcomingTasks = reminders.filter((item) => {
    return item.dueDate > getCurrentDate() && item.dueDate <= getDateDaysFromNow(7);
  });

  // Filter for team members with upcoming tasks
  const teamMembersWithUpcomingTasks = [...new Set(upcomingTasks.map(item => item.assignedTo))];

  const handleDoneTask = async (id) => {
    try {
      // Update the task's status in Firestore
      const taskRef = doc(FIREBASE_DB, 'reminders', id);
      await updateDoc(taskRef, {
        completed: true,
        completedDate: getCurrentDate()
      });
      
      // Update local state
      const updatedReminders = reminders.map(item => 
        item.id === id ? {...item, completed: true, completedDate: getCurrentDate()} : item
      );
      setReminders(updatedReminders);
      
      // Show success modal
      setSuccessModal(true);
      
      // Auto-hide modal after 2 seconds
      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error marking task as done:", error);
      Alert.alert("Error", "Failed to mark task as done. Please try again.");
    }
  };

  const handleEditTask = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/EditForm',
      params: { id },
    });
  };

  const handleDeleteTask = (id) => {
    router.push({
      pathname: '/FollowUp_Reminder/DeleteForm',
      params: { id },
    });
  };

  const handleGenerateReport = () => {
    setReportModalVisible(true);
  };

  const handleAddReminder = () => {
    router.push('/FollowUp_Reminder/AddForm');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.gradientBackground}
        />
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradientBackground}
      />
      
      <Text style={styles.header}>Follow-Up Reminder Dashboard</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reminders"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        {/* Today's Follow-Ups */}
        <TouchableOpacity 
          style={[
            styles.summaryCard,
            selectedCategory === 'today' && styles.selectedSummaryCard
          ]}
          onPress={() => handleCategorySelect('today')}
        >
          <LinearGradient
            colors={['#2980b9', '#3498db']}
            style={styles.gradientCard}
          >
            <Text style={styles.summaryTitle}>Today's Follow-Ups</Text>
            <Text style={styles.summaryNumber}>{todaysFollowUps.length}</Text>
            <Text style={styles.summarySubtext}>{highPriorityToday.length} High Priority</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Overdue Tasks */}
        <TouchableOpacity 
          style={[
            styles.summaryCard,
            selectedCategory === 'overdue' && styles.selectedSummaryCard
          ]}
          onPress={() => handleCategorySelect('overdue')}
        >
          <LinearGradient
            colors={['#c0392b', '#e74c3c']}
            style={styles.gradientCard}
          >
            <Text style={styles.summaryTitle}>Overdue Tasks</Text>
            <Text style={styles.summaryNumber}>{overdueTasks.length}</Text>
            <Text style={styles.summarySubtext}>Action Required</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Upcoming Tasks */}
        <TouchableOpacity 
          style={[
            styles.summaryCard,
            selectedCategory === 'upcoming' && styles.selectedSummaryCard
          ]}
          onPress={() => handleCategorySelect('upcoming')}
        >
          <LinearGradient
            colors={['#27ae60', '#2ecc71']}
            style={styles.gradientCard}
          >
            <Text style={styles.summaryTitle}>Upcoming (7 Days)</Text>
            <Text style={styles.summaryNumber}>{upcomingTasks.length}</Text>
            <Text style={styles.summarySubtext}>{teamMembersWithUpcomingTasks.length} Team Members</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* View All button */}
      <TouchableOpacity 
        style={[
          styles.viewAllButton,
          selectedCategory === 'all' && styles.selectedViewAllButton
        ]}
        onPress={() => handleCategorySelect('all')}
      >
        <Text style={styles.viewAllButtonText}>
          {selectedCategory === 'all' ? 'Viewing All Tasks' : 'View All Tasks'}
        </Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.taskListContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'today' ? "Today's Tasks" :
           selectedCategory === 'overdue' ? "Overdue Tasks" :
           selectedCategory === 'upcoming' ? "Upcoming Tasks" : "All Tasks"}
        </Text>
        
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="calendar-outline" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>No tasks found</Text>
          </View>
        ) : (
          filteredReminders.map((item) => (
            <View key={item.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskDetails}>
                  <View style={styles.taskRow}>
                    <Text style={styles.taskLabel}>Contact</Text>
                    <Text style={styles.taskLabel}>Tasks</Text>
                    <Text style={styles.taskLabel}>Due Date</Text>
                    <Text style={styles.taskLabel}>Assigned To</Text>
                    <Text style={styles.taskLabel}>Status</Text>
                  </View>
                  
                  <View style={styles.taskRow}>
                    <Text style={styles.taskValue}>{item.contact || '-'}</Text>
                    <Text style={styles.taskValue}>{item.task}</Text>
                    <Text style={styles.taskValue}>{formatDate(item.dueDate)}</Text>
                    <Text style={styles.taskValue}>{item.assignedTo}</Text>
                    <View style={styles.statusContainer}>
                      <Text style={[
                        styles.statusText,
                        item.status === 'Urgent' ? styles.statusUrgent : styles.statusNormal
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.taskActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.doneButton]}
                  onPress={() => handleDoneTask(item.id)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditTask(item.id)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteTask(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      
      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.bottomButton, styles.reportButton]}
          onPress={handleGenerateReport}
        >
          <LinearGradient
            colors={['#f39c12', '#e67e22']}
            style={styles.gradientButton}
          >
            <Text style={styles.bottomButtonText}>Generate Report</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomButton, styles.reminderButton]}
          onPress={handleAddReminder}
        >
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            style={styles.gradientButton}
          >
            <Text style={styles.bottomButtonText}>+ New Reminder</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* Success Modal */}
      <Modal
        transparent={true}
        visible={successModal}
        animationType="fade"
        onRequestClose={() => setSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Ionicons name="checkmark-circle" size={50} color="#2ecc71" />
            <Text style={styles.successModalText}>Task marked as done!</Text>
          </View>
        </View>
      </Modal>
      
      {/* Monthly Report Modal */}
      <Modal
        transparent={true}
        visible={reportModalVisible}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.reportModalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportModalHeader}>Monthly Tasks Report</Text>
            
            <ScrollView style={styles.reportScrollView}>
              {Object.keys(monthlyReport).length === 0 ? (
                <Text style={styles.noReportText}>No data available for reporting</Text>
              ) : (
                Object.keys(monthlyReport).sort().reverse().map(month => {
                  const data = monthlyReport[month];
                  const [year, monthNum] = month.split('-');
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                      'July', 'August', 'September', 'October', 'November', 'December'];
                  const monthName = monthNames[parseInt(monthNum) - 1];
                  
                  return (
                    <View key={month} style={styles.monthlyReportCard}>
                      <Text style={styles.monthlyReportTitle}>{monthName} {year}</Text>
                      
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Total Tasks:</Text>
                        <Text style={styles.reportValue}>{data.total}</Text>
                      </View>
                      
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Completed:</Text>
                        <Text style={styles.reportValue}>{data.completed}</Text>
                      </View>
                      
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Urgent Tasks:</Text>
                        <Text style={styles.reportValue}>{data.urgent}</Text>
                      </View>
                      
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Normal Tasks:</Text>
                        <Text style={styles.reportValue}>{data.normal}</Text>
                      </View>
                      
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Overdue Tasks:</Text>
                        <Text style={styles.reportValue}>{data.overdue}</Text>
                      </View>
                      
                      <Text style={styles.assigneesHeader}>Tasks by Assignee:</Text>
                      {Object.keys(data.byAssignee).map(assignee => (
                        <View key={assignee} style={styles.assigneeRow}>
                          <Text style={styles.assigneeName}>{assignee}:</Text>
                          <Text style={styles.assigneeValue}>{data.byAssignee[assignee]}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeReportButton}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={styles.closeReportButtonText}>Close Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper function to format date from YYYY-MM-DD to more readable format
const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const month = months[parseInt(parts[1]) - 1];
  return `${month}-${parts[2]}`;
};

export default Reminder_Summary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    width: '31%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  selectedSummaryCard: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  gradientCard: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryNumber: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 5,
    color: '#fff',
  },
  summarySubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  selectedViewAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: '#fff',
  },
  viewAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  taskListContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
    paddingLeft: 5,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  taskHeader: {
    padding: 15,
  },
  taskDetails: {
    flex: 1,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskLabel: {
    fontSize: 12,
    color: '#777',
    width: '20%',
    fontWeight: '500',
  },
  taskValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: '20%',
  },
  statusContainer: {
    width: '20%',
    alignItems: 'flex-start',
  },
  statusText: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  statusUrgent: {
    backgroundColor: '#e74c3c',
    color: '#fff',
  },
  statusNormal: {
    backgroundColor: '#3498db',
    color: '#fff',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  doneButton: {
    backgroundColor: '#2ecc71',
  },
  doneButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomButton: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  successModalText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    color: '#333',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  reportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModal: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  reportModalHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  reportScrollView: {
    maxHeight: 400,
  },
  monthlyReportCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  monthlyReportTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  reportValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  assigneesHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  assigneeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  assigneeName: {
    fontSize: 14,
    color: '#666',
  },
  assigneeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  noReportText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
    marginBottom: 20,
  },
  closeReportButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
    alignItems: 'center',
  },
  closeReportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});