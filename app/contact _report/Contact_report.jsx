// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Dimensions } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
// import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
// import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';

// export default function Contact_report() {
//   const [timeRange, setTimeRange] = useState('week');
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     added: 0,
//     deleted: 0,
//     chartData: []
//   });
//   const [selectedChart, setSelectedChart] = useState('bar');
//   const [showChartModal, setShowChartModal] = useState(false);

//   useEffect(() => {
//     fetchContactStats();
//   }, [timeRange]);

//   const fetchContactStats = async () => {
//     try {
//       setLoading(true);
//       const user = FIREBASE_AUTH.currentUser;
//       if (!user) return;

//       // Calculate date ranges
//       const now = new Date();
//       let startDate = new Date();
      
//       if (timeRange === 'day') {
//         startDate.setDate(now.getDate() - 1);
//       } else if (timeRange === 'week') {
//         startDate.setDate(now.getDate() - 7);
//       } else {
//         startDate.setMonth(now.getMonth() - 1);
//       }

//       // Query for added contacts
//       const addedContactsQuery = query(
//         collection(FIREBASE_DB, "contacts"),
//         where("userId", "==", user.uid),
//         where("createdAt", ">=", startDate),
//         orderBy("createdAt", "asc")
//       );

//       // Query for deleted contacts
//       const deletedContactsQuery = query(
//         collection(FIREBASE_DB, "deletedContacts"),
//         where("userId", "==", user.uid),
//         where("deletedAt", ">=", startDate),
//         orderBy("deletedAt", "asc")
//       );

//       const [addedSnapshot, deletedSnapshot] = await Promise.all([
//         getDocs(addedContactsQuery),
//         getDocs(deletedContactsQuery)
//       ]);

//       // Process data for chart
//       const chartData = processChartData(addedSnapshot.docs, deletedSnapshot.docs);

//       setStats({
//         added: addedSnapshot.size,
//         deleted: deletedSnapshot.size,
//         chartData
//       });
//     } catch (error) {
//       console.error("Error fetching contact stats: ", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processChartData = (addedDocs, deletedDocs) => {
//     const dataMap = {};
//     const now = new Date();
//     let currentDate = new Date();
    
//     // Initialize data structure based on time range
//     if (timeRange === 'day') {
//       currentDate.setHours(0, 0, 0, 0);
//       for (let i = 0; i < 24; i++) {
//         dataMap[i] = { added: 0, deleted: 0, label: `${i}:00` };
//       }
//     } else if (timeRange === 'week') {
//       currentDate.setDate(now.getDate() - 6);
//       currentDate.setHours(0, 0, 0, 0);
//       for (let i = 0; i < 7; i++) {
//         const date = new Date(currentDate);
//         date.setDate(date.getDate() + i);
//         dataMap[date.toDateString()] = { 
//           added: 0, 
//           deleted: 0, 
//           label: date.toLocaleDateString('en-US', { weekday: 'short' }) 
//         };
//       }
//     } else {
//       currentDate.setMonth(now.getMonth() - 1);
//       currentDate.setDate(1);
//       const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
//       for (let i = 1; i <= daysInMonth; i++) {
//         dataMap[i] = { added: 0, deleted: 0, label: `${i}` };
//       }
//     }

//     // Process added contacts
//     addedDocs.forEach(doc => {
//       const date = doc.data().createdAt.toDate();
//       if (timeRange === 'day') {
//         const hour = date.getHours();
//         dataMap[hour].added += 1;
//       } else if (timeRange === 'week') {
//         const day = date.toDateString();
//         if (dataMap[day]) {
//           dataMap[day].added += 1;
//         }
//       } else {
//         const day = date.getDate();
//         dataMap[day].added += 1;
//       }
//     });

//     // Process deleted contacts
//     deletedDocs.forEach(doc => {
//       const date = doc.data().deletedAt.toDate();
//       if (timeRange === 'day') {
//         const hour = date.getHours();
//         dataMap[hour].deleted += 1;
//       } else if (timeRange === 'week') {
//         const day = date.toDateString();
//         if (dataMap[day]) {
//           dataMap[day].deleted += 1;
//         }
//       } else {
//         const day = date.getDate();
//         dataMap[day].deleted += 1;
//       }
//     });

//     return Object.values(dataMap);
//   };

//   const generatePDF = async () => {
//     try {
//       const html = `
//         <html>
//           <head>
//             <style>
//               body { font-family: Arial; padding: 20px; }
//               h1 { color: #2979FF; text-align: center; }
//               .stats { display: flex; justify-content: space-around; margin: 20px 0; }
//               .stat-box { text-align: center; padding: 15px; border-radius: 8px; width: 45%; }
//               .added { background-color: #e3f2fd; }
//               .deleted { background-color: #ffebee; }
//               .chart-title { text-align: center; margin: 20px 0; }
//               .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
//             </style>
//           </head>
//           <body>
//             <h1>Contact Activity Report</h1>
//             <div class="stats">
//               <div class="stat-box added">
//                 <h3>Contacts Added</h3>
//                 <h2>${stats.added}</h2>
//               </div>
//               <div class="stat-box deleted">
//                 <h3>Contacts Deleted</h3>
//                 <h2>${stats.deleted}</h2>
//               </div>
//             </div>
//             <div class="chart-title">
//               <h3>Activity Over ${timeRange === 'day' ? '24 Hours' : timeRange === 'week' ? '7 Days' : '1 Month'}</h3>
//             </div>
//             <div class="footer">
//               <p>Report generated on ${new Date().toLocaleString()}</p>
//             </div>
//           </body>
//         </html>
//       `;

//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri, {
//         mimeType: 'application/pdf',
//         dialogTitle: 'Share Contact Report',
//         UTI: 'com.adobe.pdf'
//       });
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//     }
//   };

//   const renderChart = () => {
//     const chartConfig = {
//       backgroundColor: '#ffffff',
//       backgroundGradientFrom: '#ffffff',
//       backgroundGradientTo: '#ffffff',
//       decimalPlaces: 0,
//       color: (opacity = 1) => `rgba(41, 121, 255, ${opacity})`,
//       labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//       style: {
//         borderRadius: 16
//       },
//       propsForDots: {
//         r: '4',
//         strokeWidth: '2',
//         stroke: '#2979FF'
//       }
//     };

//     const screenWidth = Dimensions.get('window').width * 0.9;

//     if (selectedChart === 'bar') {
//       return (
//         <BarChart
//           data={{
//             labels: stats.chartData.map(item => item.label),
//             datasets: [
//               {
//                 data: stats.chartData.map(item => item.added),
//                 color: (opacity = 1) => `rgba(41, 121, 255, ${opacity})`,
//                 strokeWidth: 2
//               },
//               {
//                 data: stats.chartData.map(item => item.deleted),
//                 color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`,
//                 strokeWidth: 2
//               }
//             ],
//             legend: ['Added', 'Deleted']
//           }}
//           width={screenWidth}
//           height={220}
//           yAxisLabel=""
//           chartConfig={chartConfig}
//           verticalLabelRotation={30}
//           fromZero
//           style={{
//             marginVertical: 8,
//             borderRadius: 16
//           }}
//         />
//       );
//     } else if (selectedChart === 'line') {
//       return (
//         <LineChart
//           data={{
//             labels: stats.chartData.map(item => item.label),
//             datasets: [
//               {
//                 data: stats.chartData.map(item => item.added),
//                 color: (opacity = 1) => `rgba(41, 121, 255, ${opacity})`,
//                 strokeWidth: 2
//               },
//               {
//                 data: stats.chartData.map(item => item.deleted),
//                 color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`,
//                 strokeWidth: 2
//               }
//             ],
//             legend: ['Added', 'Deleted']
//           }}
//           width={screenWidth}
//           height={220}
//           yAxisLabel=""
//           chartConfig={chartConfig}
//           bezier
//           style={{
//             marginVertical: 8,
//             borderRadius: 16
//           }}
//         />
//       );
//     } else {
//       return (
//         <PieChart
//           data={[
//             {
//               name: 'Added',
//               population: stats.added,
//               color: '#2979FF',
//               legendFontColor: '#7F7F7F',
//               legendFontSize: 15
//             },
//             {
//               name: 'Deleted',
//               population: stats.deleted,
//               color: '#FF5252',
//               legendFontColor: '#7F7F7F',
//               legendFontSize: 15
//             }
//           ]}
//           width={screenWidth}
//           height={220}
//           chartConfig={chartConfig}
//           accessor="population"
//           backgroundColor="transparent"
//           paddingLeft="15"
//           absolute
//         />
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Time Range Selector */}
//       <View style={styles.timeRangeContainer}>
//         <TouchableOpacity 
//           style={[styles.timeRangeButton, timeRange === 'day' && styles.activeTimeRange]}
//           onPress={() => setTimeRange('day')}
//         >
//           <Text style={[styles.timeRangeText, timeRange === 'day' && styles.activeTimeRangeText]}>Day</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
//           onPress={() => setTimeRange('week')}
//         >
//           <Text style={[styles.timeRangeText, timeRange === 'week' && styles.activeTimeRangeText]}>Week</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.timeRangeButton, timeRange === 'month' && styles.activeTimeRange]}
//           onPress={() => setTimeRange('month')}
//         >
//           <Text style={[styles.timeRangeText, timeRange === 'month' && styles.activeTimeRangeText]}>Month</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Export Button */}
//       <TouchableOpacity onPress={generatePDF} style={styles.exportButton}>
//         <Ionicons name="download-outline" size={20} color="#2979FF" />
//         <Text style={styles.exportText}>Export Report</Text>
//       </TouchableOpacity>

//       {/* Stats Overview */}
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#2979FF" />
//         </View>
//       ) : (
//         <ScrollView contentContainerStyle={styles.contentContainer}>
//           <View style={styles.statsContainer}>
//             <View style={[styles.statCard, styles.addedCard]}>
//               <Text style={styles.statLabel}>Contacts Added</Text>
//               <Text style={styles.statValue}>{stats.added}</Text>
//             </View>
//             <View style={[styles.statCard, styles.deletedCard]}>
//               <Text style={styles.statLabel}>Contacts Deleted</Text>
//               <Text style={styles.statValue}>{stats.deleted}</Text>
//             </View>
//           </View>

//           {/* Chart Selection */}
//           <View style={styles.chartTypeContainer}>
//             <TouchableOpacity 
//               style={[styles.chartTypeButton, selectedChart === 'bar' && styles.activeChartType]}
//               onPress={() => setSelectedChart('bar')}
//             >
//               <Text style={[styles.chartTypeText, selectedChart === 'bar' && styles.activeChartTypeText]}>Bar</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.chartTypeButton, selectedChart === 'line' && styles.activeChartType]}
//               onPress={() => setSelectedChart('line')}
//             >
//               <Text style={[styles.chartTypeText, selectedChart === 'line' && styles.activeChartTypeText]}>Line</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.chartTypeButton, selectedChart === 'pie' && styles.activeChartType]}
//               onPress={() => setSelectedChart('pie')}
//             >
//               <Text style={[styles.chartTypeText, selectedChart === 'pie' && styles.activeChartTypeText]}>Pie</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Chart */}
//           <TouchableOpacity onPress={() => setShowChartModal(true)}>
//             <View style={styles.chartContainer}>
//               {renderChart()}
//             </View>
//           </TouchableOpacity>

//           {/* Activity Details */}
//           <Text style={styles.sectionTitle}>Activity Details</Text>
//           <View style={styles.activityContainer}>
//             {stats.chartData.map((item, index) => (
//               <View key={index} style={styles.activityItem}>
//                 <Text style={styles.activityLabel}>{item.label}</Text>
//                 <View style={styles.activityStats}>
//                   <View style={styles.activityStat}>
//                     <Text style={styles.activityAdded}>+{item.added}</Text>
//                   </View>
//                   <View style={styles.activityStat}>
//                     <Text style={styles.activityDeleted}>-{item.deleted}</Text>
//                   </View>
//                 </View>
//               </View>
//             ))}
//           </View>
//         </ScrollView>
//       )}

//       {/* Chart Modal (for larger view) */}
//       <Modal visible={showChartModal} animationType="slide" transparent={false}>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity 
//             style={styles.closeModalButton}
//             onPress={() => setShowChartModal(false)}
//           >
//             <Ionicons name="close" size={24} color="white" />
//           </TouchableOpacity>
//           <View style={styles.modalChartContainer}>
//             {renderChart()}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//     paddingTop: 0,
//   },
//   timeRangeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 10,
//     paddingHorizontal: 20,
//   },
//   timeRangeButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     backgroundColor: '#e0e0e0',
//   },
//   activeTimeRange: {
//     backgroundColor: '#2979FF',
//   },
//   timeRangeText: {
//     color: '#666',
//     fontWeight: '500',
//   },
//   activeTimeRangeText: {
//     color: 'white',
//   },
//   exportButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     marginHorizontal: 20,
//     marginBottom: 10,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#2979FF',
//   },
//   exportText: {
//     color: '#2979FF',
//     fontWeight: '500',
//     marginLeft: 5,
//   },
//   contentContainer: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   statCard: {
//     width: '48%',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1.5,
//   },
//   addedCard: {
//     backgroundColor: '#e3f2fd',
//   },
//   deletedCard: {
//     backgroundColor: '#ffebee',
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   chartTypeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 15,
//   },
//   chartTypeButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     marginHorizontal: 5,
//     borderRadius: 15,
//     backgroundColor: '#e0e0e0',
//   },
//   activeChartType: {
//     backgroundColor: '#2979FF',
//   },
//   chartTypeText: {
//     color: '#666',
//     fontWeight: '500',
//   },
//   activeChartTypeText: {
//     color: 'white',
//   },
//   chartContainer: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1.5,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   activityContainer: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 15,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1.5,
//   },
//   activityItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   activityLabel: {
//     fontSize: 14,
//     color: '#666',
//     flex: 1,
//   },
//   activityStats: {
//     flexDirection: 'row',
//     width: 100,
//     justifyContent: 'space-between',
//   },
//   activityStat: {
//     width: 40,
//     alignItems: 'center',
//   },
//   activityAdded: {
//     color: '#2979FF',
//     fontWeight: 'bold',
//   },
//   activityDeleted: {
//     color: '#FF5252',
//     fontWeight: 'bold',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#2979FF',
//     paddingTop: 50,
//   },
//   closeModalButton: {
//     position: 'absolute',
//     top: 60,
//     right: 20,
//     zIndex: 1,
//     padding: 10,
//   },
//   modalChartContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     marginTop: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//   },
// });