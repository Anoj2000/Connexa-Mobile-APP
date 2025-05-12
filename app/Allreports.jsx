// app/Allreports.jsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ContactReport from './contact _report/Contact_report';
import FollowUp_Report from './followup_report/FollowUp_Report';
import LogsReportScreen from './interaction-tracking-system/logsReport'

export default function Allreports() {
  const [activeTab, setActiveTab] = useState('contact');
  

  return (
    <View style={styles.container}>

      {/* Report Type Tab - Now with 4 tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainerScroll}
      >
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>Contact Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'interaction' && styles.activeTab]}
          onPress={() => setActiveTab('interaction')}
        >
          <Text style={[styles.tabText, activeTab === 'interaction' && styles.activeTabText]}>Interaction Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'followup' && styles.activeTab]}
          onPress={() => setActiveTab('followup')}
        >
          <Text style={[styles.tabText, activeTab === 'followup' && styles.activeTabText]}>Follow-up Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'share' && styles.activeTab]}
          onPress={() => setActiveTab('share')}
        >
          <Text style={[styles.tabText, activeTab === 'share' && styles.activeTabText]}>Share & Collaboration</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Report Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'contact' && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Contact Activity Report</Text>
            <ContactReport />
          </View>
        )}

        {activeTab === 'interaction' && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Interaction Activity Report</Text>
            <View style={styles.placeholder}>
              <LogsReportScreen/>
            </View>
          </View>
        )}

{activeTab === 'followup' && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Follow-up Statistics</Text>
            <FollowUp_Report />
          </View>
        )}

        {activeTab === 'share' && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Share & Collaboration</Text>
            <View style={styles.placeholder}>
              <Text>Team sharing and collaboration statistics will be displayed here</Text>
              <Text style={{marginTop: 10}}>• Shared contacts</Text>
              <Text>• Collaboration activities</Text>
              <Text>• Team performance metrics</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  tabContainerScroll: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#2979FF',
    borderRadius: 5,
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  activeTabText: {
    color: 'white',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  reportSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  placeholder: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 200,
  },
});