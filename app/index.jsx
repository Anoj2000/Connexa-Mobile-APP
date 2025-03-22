// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet } from 'react-native';
// import "../firebaseConfig";

// import { Link } from 'expo-router';

// import TabNavigation from './(tabs)/_layout';


// export default function App() {
//   return (
//     <>

//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Welcome</Text>
//       <Link href="/FollowUp_Reminder/Create_FollowUp" style={{ color: 'blue'}}>go to create new</Link>
//       <Link href="/FollowUp_Reminder/Edit_FollowUp" style={{ color: 'blue'}}>Edit the follow up</Link>
//       <Link href="/FollowUp_Reminder/Delete_FollowUp" style={{ color: 'blue'}}>Delete the follow up</Link>
//       <Link href="/FollowUp_Reminder/FollowUp_Dashboard" style={{ color: 'blue'}}>Follow Up Dashboard</Link>
//     </View>

    
//       <StatusBar style="auto" />
//       <TabNavigation />
//     </>

//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },


// });




import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native'; // <-- Add View and Text
import "../firebaseConfig";

import { Link } from 'expo-router';

import TabNavigation from './(tabs)/_layout';

export default function App() {
  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Welcome</Text>
       
        <Link href="/FollowUp_Reminder/FollowUp_Dashboard" style={{ color: 'blue'}}>Follow Up Dashboard</Link>
      </View>

      <StatusBar style="auto" />
      <TabNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
