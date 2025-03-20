import { Text, View } from "react-native";
import "../firebaseConfig";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome</Text>
    </View>
  );
}
