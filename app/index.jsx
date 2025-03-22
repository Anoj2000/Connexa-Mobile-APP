import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import "../firebaseConfig";
import NewLogScreen from '../app/interaction-tracking-system/addLog.jsx';
import NotificationDeleteScreen from '../app/interaction-tracking-system/deleteLog.jsx'
//import NotificationLogScreen from '../app/interaction-tracking-system/readLog.jsx';
//import TabNavigation from './(tabs)/_layout';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      {/* <TabNavigation /> */}
      {/* <NewLogScreen/> */}
      {/* <NotificationLogScreen/> */}
      <NotificationDeleteScreen />
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

