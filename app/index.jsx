import { Text, View, Button } from "react-native";
import { useRouter } from "expo-router";
import "../firebaseConfig";

export default function Index() {
  const router = useRouter(); // Navigation hook

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome</Text>
      <Button title="Groups" onPress={() => router.push("/Sharing&Collaboration/groups")} />
    </View>
  );
}

