import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { CheckBox } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

// Background image
const backgroundImage = require("../../assets/images/img1.jpg");

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const router = useRouter(); // ✅ using expo-router

  const contacts = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Sarah Shine" },
    { id: "3", name: "James Sony" },
    { id: "4", name: "Anna Doe" },
    { id: "5", name: "Mike Brown" },
    { id: "6", name: "Emma Wilson" },
    { id: "7", name: "David Johnson" },
    { id: "8", name: "Sophia Miller" },
  ];
    // 🔍 **Filtered contacts list** (Updated as user types)
    const filteredContacts = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchText.toLowerCase())
    );

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleContactSelection = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Missing Info", "Please enter a group name.");
      return;
    }
    if (selectedContacts.length === 1) {
      Alert.alert("No Contacts", "Please select at least two contact to add.");
      return;
    }
  

    Alert.alert("Create Group", "Are you sure you want to create this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await addDoc(collection(FIREBASE_DB, "groups"), {
              name: groupName,
              description: description,
              contacts: selectedContacts,
              createdAt: Timestamp.now(),
            });
            // ✅ Show Success Message FIRST
            Alert.alert("Success", "Group created successfully.", [
              {
                text: "OK",
                onPress: () => router.push("/Sharing&Collaboration/AllGroups"), // ✅ Navigate AFTER clicking "OK"
              },
            ]);
          } catch (error) {
            console.error("Error creating group: ", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Image source={backgroundImage} style={[styles.backgroundImage, { opacity: fadeAnim }]} />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Create a New Group</Text>

          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Group Name"
            placeholderTextColor="#bbb"
            value={groupName}
            onChangeText={setGroupName}
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe this group"
            placeholderTextColor="#bbb"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.sectionTitle}>Add Contacts</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="🔍 Search contacts..."
            placeholderTextColor="#bbb"
            value={searchText}
            onChangeText={setSearchText}
          />

<ScrollView style={styles.contactListContainer}>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <View key={contact.id} style={styles.contactItem}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <CheckBox
                    checked={selectedContacts.includes(contact.id)}
                    onPress={() => toggleContactSelection(contact.id)}
                    checkedColor="blue"
                  />
                </View>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>No contacts found</Text>
      
    </View>
            )}
          </ScrollView>

          {/* ✅ Create Group Button */}
          <TouchableOpacity style={styles.buttonContainer} onPress={handleCreateGroup}>
            <LinearGradient colors={["#4A90E2", "#1E3C72"]} start={[0, 0]} end={[1, 1]} style={styles.button}>
              <Text style={styles.buttonText}>Create Group</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ✅ Cancel Button */}
          <TouchableOpacity style={styles.buttonContainer} onPress={() => router.push("/")}>
            <LinearGradient colors={["#FF6F61", "#D63031"]} start={[0, 0]} end={[1, 1]} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// styles (unchanged, keep all as-is)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  innerContainer: {
    width: "110%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2E3EBF",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#183A4F",
  },
  input: {
    height: 50,
    borderColor: "#AFC6FF",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#F4F4F4",
    marginBottom: 10,
    color: "#183A4F",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#183A4F",
  },
  searchBar: {
    height: 45,
    borderColor: "#AFC6FF",
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#F4F4F4",
    marginBottom: 10,
    color: "#183A4F",
  },
  contactListContainer: {
    maxHeight: 220,
    borderWidth: 2,
    borderColor: "#AFC6FF",
    borderRadius: 8,
    paddingVertical: 5,
    backgroundColor: "#F4F4F4",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding:10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  contactName: {
    fontSize: 16,
    color: "#183A4F",
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  
  noResultsText: {
    fontSize: 14,
    // fontWeight: "bold",
    color: "#D63031", // 🔴 More eye-catching color
  },
  
  noResultsSubText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  
});



export default CreateGroupScreen;
