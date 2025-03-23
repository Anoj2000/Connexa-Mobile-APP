import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, StatusBar, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Import Firebase functions for data retrieval
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

export default function AllContact() {
  // State for storing contacts retrieved from Firebase
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // start  the  FIREBASE DATA RETRIEVAL SECTION 
  // This useEffect hook is responsible for fetching contact data from Firebase
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Create reference to the contacts collection in Firestore
        const contactsRef = collection(FIREBASE_DB, "contacts");
        // Create a query to sort contacts by name in ascending order
        const q = query(contactsRef, orderBy("name", "asc"));
        
        // Set up real-time listener for contacts using onSnapshot
        // This will update the contacts list whenever data changes in Firestore
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const contactsList = [];
          // Iterate through each document in the snapshot
          querySnapshot.forEach((doc) => {
            // Add document data and ID to our contacts list
            contactsList.push({
              id: doc.id,
              ...doc.data()
            });
          });
          // Update state with the retrieved contacts
          setContacts(contactsList);
          setLoading(false);
        }, (error) => {
          // Handle errors in retrieving data
          console.error("Error fetching contacts: ", error);
          Alert.alert("Error", "Failed to load contacts. Please try again.");
          setLoading(false);
        });
        
        // Clean up the listener when component unmounts to prevent memory leaks
        return () => unsubscribe();
      } catch (error) {
        // Handle any errors in setting up the listener
        console.error("Error setting up contacts listener: ", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    // Call the function to fetch contacts when component mounts
    fetchContacts();
  }, []);
  // ========== END OF FIREBASE DATA RETRIEVAL SECTION ==========

  // ========== CONTACT FILTERING SECTION ==========
  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search query is empty, show all contacts
      setFilteredContacts(contacts);
    } else {
      // Filter contacts by name, phone, or email
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        contact.phone.includes(searchQuery) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);
  // ========== END OF CONTACT FILTERING SECTION ==========

  // ========== CONTACT ITEM DISPLAY SECTION ==========
  // Render each contact item in the list
  const renderContactItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => {
        // Navigate to contact details (you can implement this later)
        console.log(`View details for ${item.name}`);
        // Example: router.push(`/contact-details/${item.id}`);
      }}
    >
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          {/* Display profile image if available, otherwise show first letter of name */}
          {item.profileImage ? (
            <Image source={item.profileImage} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          )}
        </View>
        <View>
          {/* Display contact information */}
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
          <Text style={styles.contactType}>{item.type || 'Other'}</Text>
        </View>
      </View>
      <View style={styles.contactActions}>
        {/* Update action button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => {
            console.log(`Update contact ${item.name}`);
            // Navigate to update screen with contact ID
            // Example: router.push(`/contact-management/updatecontact?id=${item.id}`);
          }}
        >
          <Ionicons name="create-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
        {/* Delete action button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            console.log(`Delete contact ${item.name}`);
            // Show confirmation before deleting
            Alert.alert(
              "Delete Contact",
              `Are you sure you want to delete ${item.name}?`,
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Delete",
                  onPress: () => {
                    console.log(`Confirmed delete for ${item.id}`);
                    // Implement delete functionality here
                    // Example: deleteContact(item.id);
                  },
                  style: "destructive"
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  // ========== END OF CONTACT ITEM DISPLAY SECTION ==========

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2979FF" barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Contacts</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar Section */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* ========== CONTACT LIST DISPLAY SECTION ========== */}
      {loading ? (
        // Show loading indicator while fetching contacts
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading contacts...</Text>
        </View>
      ) : filteredContacts.length > 0 ? (
        // Display contacts if available
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        // Show message if no contacts found
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No contacts found</Text>
        </View>
      )}
      {/* ========== END OF CONTACT LIST DISPLAY SECTION ========== */}
      
      {/* Floating Action Button for adding new contacts */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/contact-management/addcontact')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

// Styles definition
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2979FF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  contactPhone: {
    color: '#666',
    fontSize: 14,
    marginBottom: 3,
  },
  contactType: {
    color: '#999',
    fontSize: 12,
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  updateButton: {
    backgroundColor: '#E8F5E9',  // Light green background
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',  // Light red background
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    marginTop: 10,
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
});