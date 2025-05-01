import React, { useEffect, useState } from "react";
import { generatePDF } from "./pdfGenerator"; 

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';


const ViewGroup = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGroupDetails = async () => {
    try {
      const docRef = doc(FIREBASE_DB, "groups", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGroup({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (error) {
      console.error("Error fetching group:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGroupDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>❌ Group not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AntDesign name="arrowleft" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📂 Group Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Group Name</Text>
        <Text style={styles.value}>{group.name}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{group.description || "N/A"}</Text>

        <Text style={styles.label}>Members</Text>
        <Text style={styles.value}>
          {group.contacts?.length > 0 ? group.contacts.join(", ") : "No members added"}
        </Text>
      </View>

      
<TouchableOpacity style={styles.buttonContainer} onPress={() => router.push({ pathname: "/Sharing&Collaboration/EditOneGroup", params: { id: group.id } })}>
<LinearGradient colors={["#007BFF", "#007BFF"]} start={[0, 0]} end={[1, 1]} style={styles.button}>
  <Text style={styles.buttonText}>Update</Text>
</LinearGradient>

</TouchableOpacity>


<TouchableOpacity style={styles.buttonContainer} onPress={() => generatePDF(group)}>
  <LinearGradient colors={["#28a745", "#28a745"]} start={[0, 0]} end={[1, 1]} style={styles.button}>
    <Text style={styles.buttonText}>Report</Text>
  </LinearGradient>
</TouchableOpacity>



<TouchableOpacity style={styles.buttonContainer} onPress={() => router.back()}>
<LinearGradient colors={["#FF0000", "#FF0000"]} start={[0, 0]} end={[1, 1]} style={styles.button}>
  <Text style={styles.buttonText}>Back</Text>
</LinearGradient>
</TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: "#F4F8FB",
    flexGrow: 1,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F8FB",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3C72",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 70,
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
  
  primary: {
    backgroundColor: "#4A90E2",
  },
  secondary: {
    backgroundColor: "#E0E0E0",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  error: {
    color: "#e74c3c",
    fontSize: 18,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: "#1E3C72",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ViewGroup;
