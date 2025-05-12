import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart, PieChart } from 'recharts';

const FollowUp_Report = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueRate: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    assigneePerformance: [],
  });

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
        calculatePerformanceMetrics(list);
      } catch (err) {
        console.error('Error fetching reminders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

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
      
      if (reminder.dueDate < getCurrentDate() && !reminder.completed) {
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

  const calculatePerformanceMetrics = (reminderList) => {
    if (reminderList.length === 0) {
      return;
    }
    
    const totalTasks = reminderList.length;
    const completedTasks = reminderList.filter(item => item.completed).length;
    const overdueTasks = reminderList.filter(item => 
      item.dueDate < getCurrentDate() && !item.completed
    ).length;
    
    // Calculate completion time for completed tasks
    let totalCompletionDays = 0;
    let tasksWithCompletionData = 0;
    
    reminderList.forEach(task => {
      if (task.completed && task.completedDate && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const completedDate = new Date(task.completedDate);
        const diffTime = Math.abs(completedDate - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalCompletionDays += diffDays;
        tasksWithCompletionData++;
      }
    });
    
    // Group performance by assignee
    const assigneeMap = {};
    reminderList.forEach(task => {
      const assignee = task.assignedTo || 'Unassigned';
      if (!assigneeMap[assignee]) {
        assigneeMap[assignee] = {
          name: assignee,
          total: 0,
          completed: 0,
          overdue: 0
        };
      }
      
      assigneeMap[assignee].total++;
      
      if (task.completed) {
        assigneeMap[assignee].completed++;
      }
      
      if (task.dueDate < getCurrentDate() && !task.completed) {
        assigneeMap[assignee].overdue++;
      }
    });
    
    const assigneePerformance = Object.values(assigneeMap).map(data => ({
      ...data,
      completionRate: data.total > 0 ? (data.completed / data.total * 100).toFixed(1) : 0,
      overdueRate: data.total > 0 ? (data.overdue / data.total * 100).toFixed(1) : 0
    }));
    
    setPerformanceMetrics({
      totalTasks,
      completedTasks,
      overdueRate: totalTasks > 0 ? (overdueTasks / totalTasks * 100).toFixed(1) : 0,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
      averageCompletionTime: tasksWithCompletionData > 0 ? (totalCompletionDays / tasksWithCompletionData).toFixed(1) : 0,
      assigneePerformance
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2979FF" />
        <Text style={styles.loadingText}>Loading report data...</Text>
      </View>
    );
  }

  // Prepare data for charts
  const chartData = Object.keys(monthlyReport).map(month => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[parseInt(monthNum) - 1];
    
    return {
      name: `${monthName} ${year}`,
      completed: monthlyReport[month].completed,
      urgent: monthlyReport[month].urgent,
      normal: monthlyReport[month].normal,
      overdue: monthlyReport[month].overdue
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const pieData = [
    { name: 'Completed', value: performanceMetrics.completedTasks, color: '#2ecc71' },
    { name: 'Pending', value: performanceMetrics.totalTasks - performanceMetrics.completedTasks, color: '#3498db' }
  ];

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryCardsContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Total Tasks</Text>
          <Text style={styles.summaryCardValue}>{performanceMetrics.totalTasks}</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Completion Rate</Text>
          <Text style={styles.summaryCardValue}>{performanceMetrics.completionRate}%</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Overdue Rate</Text>
          <Text style={styles.summaryCardValue}>{performanceMetrics.overdueRate}%</Text>
        </View>
      </View>

      {/* Monthly Trends */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Task Trends</Text>
        {chartData.length > 0 ? (
          <View style={styles.chart}>
            {/* We would render actual charts here in a real app */}
            <Text style={styles.placeholderText}>Monthly trend chart would display here</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
                <Text style={styles.legendText}>Overdue</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#f39c12' }]} />
                <Text style={styles.legendText}>Urgent</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="bar-chart-outline" size={40} color="#ccc" />
            <Text style={styles.noDataText}>No monthly data available</Text>
          </View>
        )}
      </View>

      {/* Team Performance */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Team Performance</Text>
        {performanceMetrics.assigneePerformance.length > 0 ? (
          <View style={styles.teamPerformanceContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Assignee</Text>
              <Text style={styles.tableHeaderCell}>Tasks</Text>
              <Text style={styles.tableHeaderCell}>Complete</Text>
              <Text style={styles.tableHeaderCell}>Rate</Text>
            </View>
            
            {performanceMetrics.assigneePerformance.map((assignee, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  index % 2 === 0 ? styles.evenRow : null
                ]}
              >
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1} ellipsizeMode="tail">
                  {assignee.name}
                </Text>
                <Text style={styles.tableCell}>{assignee.total}</Text>
                <Text style={styles.tableCell}>{assignee.completed}</Text>
                <Text style={styles.tableCell}>{assignee.completionRate}%</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="people-outline" size={40} color="#ccc" />
            <Text style={styles.noDataText}>No team data available</Text>
          </View>
        )}
      </View>

      {/* Task Status Distribution */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Task Status Distribution</Text>
        {performanceMetrics.totalTasks > 0 ? (
          <View style={styles.pieChartContainer}>
            {/* We would render actual pie chart here in a real app */}
            <Text style={styles.placeholderText}>Pie chart would display here</Text>
            <View style={styles.pieStats}>
              <View style={styles.pieStatItem}>
                <View style={[styles.pieStatColor, { backgroundColor: '#2ecc71' }]} />
                <Text style={styles.pieStatLabel}>Completed</Text>
                <Text style={styles.pieStatValue}>{performanceMetrics.completedTasks}</Text>
              </View>
              <View style={styles.pieStatItem}>
                <View style={[styles.pieStatColor, { backgroundColor: '#3498db' }]} />
                <Text style={styles.pieStatLabel}>Pending</Text>
                <Text style={styles.pieStatValue}>
                  {performanceMetrics.totalTasks - performanceMetrics.completedTasks}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="pie-chart-outline" size={40} color="#ccc" />
            <Text style={styles.noDataText}>No task status data available</Text>
          </View>
        )}
      </View>

      {/* Key Metrics */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.keyMetricsContainer}>
          <View style={styles.metricItem}>
            <Ionicons name="timer-outline" size={24} color="#3498db" />
            <Text style={styles.metricLabel}>Avg. Completion Time</Text>
            <Text style={styles.metricValue}>{performanceMetrics.averageCompletionTime} days</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
            <Text style={styles.metricLabel}>Overdue Tasks</Text>
            <Text style={styles.metricValue}>
              {reminders.filter(item => item.dueDate < getCurrentDate() && !item.completed).length}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Ionicons name="flame-outline" size={24} color="#f39c12" />
            <Text style={styles.metricLabel}>Urgent Tasks</Text>
            <Text style={styles.metricValue}>
              {reminders.filter(item => item.status === 'Urgent' && !item.completed).length}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  summaryCardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2979FF',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  teamPerformanceContainer: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  evenRow: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  pieStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  pieStatItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  pieStatColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  pieStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  pieStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  keyMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
});

export default FollowUp_Report;