import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";
import { useRouter } from "expo-router";


const AllGroups = () => {
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
      <Text style={styles.header}>My Groups</Text>

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
            <View>
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
            <TouchableOpacity onPress={() => router.push({ pathname: "/Sharing&Collaboration/ViewGroup", params: { id: item.id } })}>
  <AntDesign name="arrowright" size={24} color="#1E3C72" />
</TouchableOpacity>

          </View>
        )}
      />

<TouchableOpacity style={styles.fab} onPress={() => router.push("/Sharing&Collaboration/CreateGroupScreen")}>
  <LinearGradient
    colors={["#4A90E2", "#1E3C72"]}
    start={[0, 0]}
    end={[1, 1]}
    style={styles.fabGradient}
  >
    <AntDesign name="plus" size={26} color="#fff" />
  </LinearGradient>
</TouchableOpacity>
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 6,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AllGroups;
