import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChatHeader from '../(chats)/chatHeader';
import ChatList from '../(chats)/chatList';


const Chat = () => {
  return (
    <View style={styles.container}>
      <ChatHeader/>
      <ChatList/>
    </View>
  );
};

export default Chat; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});