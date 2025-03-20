import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Welcome! Start working on your app!</Text>
      <StatusBar style="auto" />
      <Link href="contact-management/addcontact" style={{ color: 'blue' }}>Go to Contact ADD</Link>
      <Link href="contact-management/Updatecontact" style={{ color: 'blue' }}>Go to Update page</Link>
    </View>
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
