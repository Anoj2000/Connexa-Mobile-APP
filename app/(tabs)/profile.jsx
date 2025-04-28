import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Switch
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Info */}
      <ScrollView>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.profileImage} 
          />
          <View style={styles.cameraIcon}>
            <TouchableOpacity>
              <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileStatus}>Available</Text>
        </View>

        {/* Media Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Media, links and docs</Text>
          <View style={styles.mediaPreviews}>
            <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.mediaPreview} />
            <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.mediaPreview} />
            <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.mediaPreview} />
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See all</Text>
            <MaterialIcons name="chevron-right" size={20} color="#075E54" />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={24} color="#075E54" />
              <Text style={styles.settingText}>Mute notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#D3D3D3", true: "#128C7E" }}
              thumbColor={muteNotifications ? "#FFFFFF" : "#FFFFFF"}
              onValueChange={() => setMuteNotifications(prevState => !prevState)}
              value={muteNotifications}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="music-note" size={24} color="#075E54" />
              <Text style={styles.settingText}>Custom notification</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="visibility" size={24} color="#075E54" />
              <Text style={styles.settingText}>Media visibility</Text>
            </View>
            <Switch
              trackColor={{ false: "#D3D3D3", true: "#128C7E" }}
              thumbColor={mediaVisibility ? "#FFFFFF" : "#FFFFFF"}
              onValueChange={() => setMediaVisibility(prevState => !prevState)}
              value={mediaVisibility}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="lock" size={24} color="#075E54" />
              <Text style={styles.settingText}>Encryption</Text>
            </View>
            <Text style={styles.encryptionText}>Messages are end-to-end encrypted</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="timer" size={24} color="#075E54" />
              <Text style={styles.settingText}>Disappearing messages</Text>
            </View>
            <Text style={styles.settingValue}>Off</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>About and phone number</Text>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>About</Text>
            <Text style={styles.contactValue}>Hey there! I am using WhatsApp.</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>+1 234 567 8900</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="block" size={24} color="#FF0000" />
            <Text style={styles.blockText}>Block</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="thumb-down" size={24} color="#FF0000" />
            <Text style={styles.blockText}>Report contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    right: '40%',
    bottom: '38%',
    backgroundColor: '#075E54',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileStatus: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  infoSection: {
    padding: 15,
    borderBottomWidth: 8,
    borderBottomColor: '#ECECEC',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#075E54',
    marginBottom: 10,
  },
  mediaPreviews: {
    flexDirection: 'row',
  },
  mediaPreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  seeAllText: {
    color: '#075E54',
    fontSize: 16,
  },
  settingsSection: {
    borderBottomWidth: 8,
    borderBottomColor: '#ECECEC',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
  },
  settingValue: {
    color: '#8E8E8E',
    fontSize: 14,
  },
  encryptionText: {
    color: '#8E8E8E',
    fontSize: 12,
    width: '50%',
    textAlign: 'right',
  },
  contactSection: {
    padding: 15,
    borderBottomWidth: 8,
    borderBottomColor: '#ECECEC',
  },
  contactItem: {
    marginVertical: 10,
  },
  contactLabel: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  contactValue: {
    fontSize: 16,
    marginTop: 5,
  },
  actionSection: {
    padding: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  blockText: {
    color: '#FF0000',
    marginLeft: 15,
    fontSize: 16,
  },
});