import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";
import { useRouter } from "expo-router";

const DeleteGroup = () => {
  const [groups, setGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const fetchGroups = async () => {
    try {
      const querySnapshot = await getDocs(collection(FIREBASE_DB, "groups"));
      const fetched = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(fetched);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleDelete = (groupId) => {
    Alert.alert("Delete Group", "Are you sure you want to delete this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(FIREBASE_DB, "groups", groupId));
            setGroups((prev) => prev.filter((group) => group.id !== groupId));
            Alert.alert("Success", "Group deleted successfully.");
          } catch (error) {
            console.error("Error deleting group:", error);
            Alert.alert("Error", "Could not delete the group.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delete Groups</Text>

      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="🔍 Search groups..."
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AntDesign name="frowno" size={50} color="#ccc" />
            <Text style={styles.noGroupsText}>No groups found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupTitle}>{item.name}</Text>
              <Text style={styles.groupInfo}>
                {item.contacts?.length || 0} contacts
              </Text>
              <Text style={styles.groupMembers}>
                {Array.isArray(item.contacts)
                  ? item.contacts.join(", ")
                  : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <AntDesign name="delete" size={24} color="#D63031" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 20,
    color: "#1E3C72",
    textAlign: "center",
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#AFC6FF",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    marginBottom: 20,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3C72",
    marginBottom: 2,
  },
  groupInfo: {
    fontSize: 14,
    color: "#555",
  },
  groupMembers: {
    fontSize: 13,
    color: "#777",
  },
  noGroupsText: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 12,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
});

export default DeleteGroup;
