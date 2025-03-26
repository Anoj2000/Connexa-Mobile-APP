import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import "../firebaseConfig";
import TabNavigation from './(tabs)/_layout';


export default function App() {
  return (
    <>
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

