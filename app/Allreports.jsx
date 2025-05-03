// // app/Allreports.jsx
// import React, { useState } from 'react';
// import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import ContactReport from './contact _report/Contact_report';

// export default function Allreports() {
//   const [activeTab, setActiveTab] = useState('contact');

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>

//         </TouchableOpacity>
//         <View style={styles.headerRight} />
//       </View>

//       {/* Report Type Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity 
//           style={[styles.tabButton, activeTab === 'contact' && styles.activeTab]}
//           onPress={() => setActiveTab('contact')}
//         >
//           <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>Contact Activity</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tabButton, activeTab === 'interaction' && styles.activeTab]}
//           onPress={() => setActiveTab('interaction')}
//         >
//           <Text style={[styles.tabText, activeTab === 'interaction' && styles.activeTabText]}>Interaction Stats</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tabButton, activeTab === 'followup' && styles.activeTab]}
//           onPress={() => setActiveTab('followup')}
//         >
//           <Text style={[styles.tabText, activeTab === 'followup' && styles.activeTabText]}>Follow-up Stats</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Report Content */}
//       <ScrollView contentContainerStyle={styles.contentContainer}>
//         {activeTab === 'contact' && (
//           <View style={styles.reportSection}>
//             <Text style={styles.sectionTitle}>Contact Activity Report</Text>
//             <ContactReport />
//           </View>
//         )}

//         {activeTab === 'interaction' && (
//           <View style={styles.reportSection}>
//             <Text style={styles.sectionTitle}>Interaction Statistics</Text>
//             <View style={styles.placeholder}>
//               <Text>Interaction reports will be displayed here</Text>
//             </View>
//           </View>
//         )}

//         {activeTab === 'followup' && (
//           <View style={styles.reportSection}>
//             <Text style={styles.sectionTitle}>Follow-up Statistics</Text>
//             <View style={styles.placeholder}>
//               <Text>Follow-up reports will be displayed here</Text>
//             </View>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#2979FF',
//     paddingTop: 50,
//     paddingBottom: 15,
//     paddingHorizontal: 15,
//   },
//   backButton: {
//     padding: 5,
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   headerRight: {
//     width: 30, // For alignment
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 10,
//     paddingHorizontal: 10,
//   },
//   tabButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//   },
//   activeTab: {
//     backgroundColor: '#2979FF',
//     borderRadius: 5,
//   },
//   tabText: {
//     color: '#666',
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: 'white',
//   },
//   contentContainer: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   reportSection: {
//     marginBottom: 30,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     marginLeft: 5,
//   },
//   placeholder: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 200,
//   },
// });