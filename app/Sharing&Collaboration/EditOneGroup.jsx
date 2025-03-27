import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { CheckBox } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

const backgroundImage = require("../../assets/images/img1.jpg");

const EditOneGroup = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const contactsList = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Sarah Shine" },
    { id: "3", name: "James Sony" },
    { id: "4", name: "Anna Doe" },
    { id: "5", name: "Mike Brown" },
    { id: "6", name: "Emma Wilson" },
    { id: "7", name: "David Johnson" },
    { id: "8", name: "Sophia Miller" },
  ];

  useEffect(() => {
    if (id) fetchGroupDetails();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const docRef = doc(FIREBASE_DB, "groups", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGroupName(data.name || "");
        setDescription(data.description || "");
        setSelectedContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching group: ", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((item) => item !== contactId)
        : [...prev, contactId]
    );
  };

  const handleUpdate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Missing Info", "Please enter a group name.");
      return;
    }
    if (selectedContacts.length === 0) {
      Alert.alert("Missing Info", "Please select at least one contact.");
      return;
    }

    try {
      const docRef = doc(FIREBASE_DB, "groups", id);
      await updateDoc(docRef, {
        name: groupName,
        description,
        contacts: selectedContacts,
        updatedAt: Timestamp.now(),
      });

      Alert.alert("Success", "Group updated successfully.", [
        {
          text: "OK",
          onPress: () => router.push("/Sharing&Collaboration/EditGroup"), // ✅ Go back to EditGroup
        },
      ]);
    } catch (error) {
      console.error("Error updating group:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image source={backgroundImage} style={[styles.backgroundImage, { opacity: fadeAnim }]} />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Update Group</Text>

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

          <ScrollView style={styles.contactListContainer}>
            {contactsList.map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <CheckBox
                  checked={selectedContacts.includes(contact.id)}
                  onPress={() => toggleContactSelection(contact.id)}
                  checkedColor="blue"
                />
              </View>
            ))}
          </ScrollView>

          {/* Update Button */}
          <TouchableOpacity style={styles.buttonContainer} onPress={handleUpdate}>
            <LinearGradient colors={["#4A90E2", "#1E3C72"]} style={styles.button}>
              <Text style={styles.buttonText}>Update Group</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.buttonContainer} onPress={() => router.push("/")}>
            <LinearGradient colors={["#FF6F61", "#D63031"]} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1E3C72",
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
  contactListContainer: {
    maxHeight: 250,
    borderWidth: 1,
    borderColor: "#AFC6FF",
    borderRadius: 8,
    paddingVertical: 5,
    backgroundColor: "#F4F4F4",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
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
});

export default EditOneGroup;
