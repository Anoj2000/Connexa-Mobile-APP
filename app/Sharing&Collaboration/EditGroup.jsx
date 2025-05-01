import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";
import { useRouter } from "expo-router";

const EditGroupScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [groups, setGroups] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "groups"));
        const fetchedGroups = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(fetchedGroups);
      } catch (error) {
        console.error("Error fetching groups: ", error);
      }
    };

    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Groups</Text>

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
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() =>
              router.push({
                pathname: "/Sharing&Collaboration/EditOneGroup",
                params: { id: item.id },
              })
            }
            activeOpacity={0.9}
          >
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
        
            
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/Sharing&Collaboration/EditOneGroup",
                  params: { id: item.id },
                })
              }
            >
              <AntDesign name="edit" size={22} color="#4A90E2" style={styles.editIcon} />
            </TouchableOpacity>
          </TouchableOpacity>
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
    marginBottom: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3C72",
    marginBottom: 2,
  },
  groupInfo: {
    fontSize: 14,
    color: "#666",
  },
  groupMembers: {
    fontSize: 13,
    color: "#999",
  },
  editIcon: {
    marginLeft: 10,
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

export default EditGroupScreen;
