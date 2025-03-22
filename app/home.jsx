import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, StatusBar, Image, Animated, Dimensions } from 'react-native';
import Sidebar from './Sidebar'; // Import the Sidebar component

const ContactsScreen = ({ contacts = [] }) => {
  // State to control sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Create animated value for sidebar animation
  const [sidebarAnimation] = useState(new Animated.Value(-300)); // Start off-screen
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -300 : 0;
    
    Animated.timing(sidebarAnimation, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setSidebarVisible(!sidebarVisible);
  };
  
  // Separate favorites from other contacts
  const favorites = contacts.filter(contact => contact.favorite);
  const otherContacts = contacts.filter(contact => !contact.favorite);

  // Render a contact item
  const renderContactItem = (item) => (
    <View style={styles.contactItem} key={item.id || item.phone}>
      <View style={styles.contactInfo}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
          {item.lastContacted && (
            <Text style={styles.lastContacted}>Last contacted: {item.lastContacted}</Text>
          )}
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>✉️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2979FF" barStyle="light-content" />
      
      {/* Animated Sidebar */}
      <Animated.View style={[
        styles.sidebarContainer,
        { transform: [{ translateX: sidebarAnimation }] }
      ]}>
        <Sidebar />
      </Animated.View>
      
      {/* Overlay when sidebar is open */}
      {sidebarVisible && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={0.5}
          onPress={toggleSidebar}
        />
      )}
      
      {/* Blue Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Image 
              source={require('../assets/images/sidebarimage.webp')} 
              style={styles.sidebarIcon} 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
        </View>
        <View style={styles.headerButtons}>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍Search contacts..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>FAVORITES</Text>
            {favorites.map(item => renderContactItem(item))}
          </>
        )}

        {/* All Contacts Section */}
        {otherContacts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>ALL CONTACTS</Text>
            {otherContacts.map(item => renderContactItem(item))}
          </>
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactsScreen;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 300,
    height: height,
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2979FF',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 40
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 18,
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 10,
    paddingLeft: 15,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactPhone: {
    color: '#666',
    fontSize: 14,
  },
  lastContacted: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  actionButtonText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabIcon: {
    fontSize: 30,
    color: 'white',
  },
});