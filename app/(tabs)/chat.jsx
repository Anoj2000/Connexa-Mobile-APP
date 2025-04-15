import { StyleSheet, View } from 'react-native';
import React from 'react';
import ChatList from '../(chats)/chatList';

const Chat = () => {
  return (
    <View style={styles.container}>
      <ChatList />
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1, // This is crucial to make the component take full screen height
  }
});