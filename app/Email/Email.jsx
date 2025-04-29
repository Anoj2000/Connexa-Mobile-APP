import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function Email() {
  // Get contact information from navigation params
  const params = useLocalSearchParams();
  const receiverEmail = params.email || '';
  const contactName = params.name || '';

  // Email form state
  const [to, setTo] = useState(receiverEmail);
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle sending email using mailto URL scheme
  const handleSendEmail = async () => {
    if (!to.trim()) {
      Alert.alert("Error", "Please enter recipient email address");
      return;
    }

    try {
      setIsLoading(true);
      
      // Create mailto URL
      let mailtoUrl = `mailto:${to}`;
      
      // Add cc if provided
      if (cc.trim()) {
        mailtoUrl += `?cc=${encodeURIComponent(cc)}`;
      }
      
      // Add subject if provided
      if (subject.trim()) {
        mailtoUrl += `${cc.trim() ? '&' : '?'}subject=${encodeURIComponent(subject)}`;
      }
      
      // Add body if provided
      if (body.trim()) {
        mailtoUrl += `${(cc.trim() || subject.trim()) ? '&' : '?'}body=${encodeURIComponent(body)}`;
      }
      
      // Open mail client
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          "Error", 
          "No email client found. Please install an email app to send emails."
        );
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to open email client: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2979FF" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compose Email</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* To Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>To:</Text>
          <TextInput
            style={styles.input}
            value={to}
            onChangeText={setTo}
            placeholder="Recipient email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        {/* CC Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Cc:</Text>
          <TextInput
            style={styles.input}
            value={cc}
            onChangeText={setCc}
            placeholder="Cc recipients (separate with commas)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        {/* Subject Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subject:</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Email subject"
          />
        </View>
        
        {/* Message Body */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Message:</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={body}
            onChangeText={setBody}
            placeholder="Write your message here..."
            multiline
            textAlignVertical="top"
            numberOfLines={10}
          />
        </View>
        
        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendEmail}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send Email</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

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
    paddingHorizontal: 15,
    paddingTop: 50, // To account for status bar
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50, // Same width as back button for balance
  },
  content: {
    flex: 1,
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#444',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2979FF',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});