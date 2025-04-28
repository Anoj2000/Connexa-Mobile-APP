import { StyleSheet, Text, View, FlatList, TouchableOpacity, Button } from 'react-native';
import React from 'react';

const profile = () => {
  // Sample contact data
  const contacts = [
    { 
      id: '1', 
      name: 'Sarah Johnson', 
      role: 'Project Manager',
      lastContact: '2025-04-25',
      interactionHistory: [
        { date: '2025-04-20', type: 'Email', notes: 'Project update' },
        { date: '2025-04-22', type: 'Call', notes: 'Budget discussion' }
      ],
      reminders: [
        { date: '2025-04-30', task: 'Follow up on deliverables' }
      ]
    },
    // Add more contacts here
  ];

  // Handle reminder creation
  const createReminder = (contact) => {
    console.log(`Creating reminder for ${contact.name}`);
    // Add calendar integration here
  };

  // Handle profile sharing
  const shareProfile = (contact) => {
    console.log(`Sharing ${contact.name}'s profile`);
    // Add sharing logic here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Professional Network</Text>
      
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactRole}>{item.role}</Text>
            
            <View style={styles.interactionSection}>
              <Text style={styles.sectionTitle}>Last Interaction:</Text>
              <Text>{item.lastContact} - {item.interactionHistory[0].type}</Text>
              <Text>Notes: {item.interactionHistory[0].notes}</Text>
            </View>

            <View style={styles.reminderSection}>
              <Text style={styles.sectionTitle}>Upcoming Reminders:</Text>
              {item.reminders.map((reminder, index) => (
                <Text key={index}>{reminder.date}: {reminder.task}</Text>
              ))}
            </View>

            <View style={styles.buttonGroup}>
              <Button
                title="Set Reminder"
                onPress={() => createReminder(item)}
                color="#007AFF"
              />
              <Button
                title="Share Profile"
                onPress={() => shareProfile(item)}
                color="#34C759"
              />
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => console.log('Add contact pressed')}
      >
        <Text style={styles.addButtonText}>+ Add New Contact</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  contactRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  interactionSection: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  reminderSection: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default profile;
