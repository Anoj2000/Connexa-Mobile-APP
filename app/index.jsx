import { Text, View } from "react-native";
import "../firebaseConfig";
import { Link } from 'expo-router';

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
      <Link href="/FollowUp_Reminder/Create_FollowUp" style={{ color: 'blue'}}>go to create new</Link>
      <Link href="/FollowUp_Reminder/Edit_FollowUp" style={{ color: 'blue'}}>Edit the follow up</Link>
      <Link href="/FollowUp_Reminder/Delete_FollowUp" style={{ color: 'blue'}}>Delete the follow up</Link>
      <Link href="/FollowUp_Reminder/FollowUp_Dashboard" style={{ color: 'blue'}}>Follow Up Dashboard</Link>
    </View>
  );
}
