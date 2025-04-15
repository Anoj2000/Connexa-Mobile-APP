import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import InteractionReminder from '../interaction-tracking-system/interactionReminder';

const Notification = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2979FF" barStyle="light-content" />
      <InteractionReminder />
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});