//update
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';


export default function Sidebar() {
  // Menu items
  const menuItems = [

    { icon: '☎️', title: 'All Contacts', screen: 'contact-management/Allcontact' },
    { icon: '⭐', title: 'Contact Interaction', screen: 'interaction-tracking-system/readLog' },
    { icon: '👥', title: 'Share & collabarotion', screen: 'Sharing&Collaboration/groups' },
    { icon: '⚙️', title: 'Settings', screen: 'settings' },
    { icon: '❓', title: 'Help & Feedback', screen: 'help' },
    { icon: '⭐', title: 'FollowUp Reminder', screen: 'FollowUp_Reminder/FollowUp_Page' },
  ];

  const handleNavigation = (screen) => {
    // Navigate to the selected screen
    router.push(`/${screen}`);
    // You might want to close the sidebar here if you have a function for that
  };


  return (
    <View style={styles.container}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
        </View>
      </View>

      {/* Menu items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => handleNavigation(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: '#2979FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60, 
    paddingBottom: 30,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 3,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 15,
    width: 26,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutText: {
    color: '#2979FF',
    fontWeight: 'bold',
  }
});