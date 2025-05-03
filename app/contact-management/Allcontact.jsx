import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, StatusBar, Image, Alert,ActivityIndicator,RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  where 
} from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';

export default function AllContact() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch contacts from Firestore
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      const contactsRef = collection(FIREBASE_DB, "contacts");
      const q = query(
        contactsRef, 
        where("userId", "==", user.uid),
        orderBy("name", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const contactsList = [];
      
      querySnapshot.forEach((doc) => {
        contactsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setContacts(contactsList);
      setFilteredContacts(contactsList);
    } catch (error) {
      console.error("Error fetching contacts: ", error);
      Alert.alert("Error", "Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Set up real-time listener
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    const contactsRef = collection(FIREBASE_DB, "contacts");
    const q = query(
      contactsRef, 
      where("userId", "==", user.uid),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const contactsList = [];
      querySnapshot.forEach((doc) => {
        contactsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setContacts(contactsList);
      setFilteredContacts(contactsList);
    }, (error) => {
      console.error("Error in snapshot: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        contact.phone.includes(searchQuery) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  // Delete contact function
  const deleteContact = async (contactId) => {
    try {
      const contactRef = doc(FIREBASE_DB, "contacts", contactId);
      await deleteDoc(contactRef);
    } catch (error) {
      console.error("Error deleting contact: ", error);
      Alert.alert("Error", "Failed to delete contact. Please try again.");
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchContacts();
  };

  // Render each contact item
  const renderContactItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => router.push({
        pathname: '/contact-management/contactDetails',
        params: { id: item.id }
      })}
    >
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.contactTextContainer}>
          <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.contactPhone} numberOfLines={1}>{item.phone}</Text>
          {item.type && (
            <View style={[
              styles.typeBadge,
              { backgroundColor: getTypeColor(item.type) }
            ]}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push({
            pathname: '/contact-management/Updatecontact',
            params: { id: item.id }
          })}
        >
          <Ionicons name="create-outline" size={22} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              "Delete Contact",
              `Are you sure you want to delete ${item.name}?`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Delete", 
                  onPress: () => deleteContact(item.id),
                  style: "destructive" 
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Helper function for contact type colors
  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'family': return '#FFD700';
      case 'friends': return '#87CEEB';
      case 'work': return '#98FB98';
      case 'office': return '#98FB98';
      default: return '#D3D3D3';
    }
  };

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
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/contact-management/addcontact')}
        >
          <Ionicons name="add" size={28} color="white" />
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
          clearButtonMode="while-editing"
        />
      </View>
      
      {/* Contact List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2979FF" />
        </View>
      ) : filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2979FF']}
              tintColor="#2979FF"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No Contacts Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Try a different search' : 'Add your first contact'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/contact-management/addcontact')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
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
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    width: '100%',
    height: '100%',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  contactPhone: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 12,
    color: '#333',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2979FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
});