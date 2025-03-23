import { StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";

// Use only image 1
const image = require("../../assets/images/img1.jpg");

export default function Groups() {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Animated.Image source={image} style={styles.backgroundImage} />
      
      {/* Overlay Effect */}
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Manage Groups</Text>

        {/* Navigation Buttons */}
        <LinkButton href="/Sharing&Collaboration/CreateGroupScreen" text="➕ Create a New Group" />
        <LinkButton href="/Sharing&Collaboration/AllGroups" text="👥 View All Groups" />
        <LinkButton href="/Sharing&Collaboration/EditGroup" text="✏️ Edit Group" />
        <LinkButton href="/Sharing&Collaboration/DeleteGroup" text="🗑️ Delete Group" />
      </View>
    </View>
  );
}

// Reusable Button Component
const LinkButton = ({ href, text }) => {
  const buttonAnim = useRef(new Animated.Value(1)).current;

  return (
    <Link href={href} asChild>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => {
          Animated.timing(buttonAnim, {
            toValue: 0.95,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.timing(buttonAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }}
        style={styles.buttonContainer}
      >
        <Animated.View style={[styles.animatedButton, { transform: [{ scale: buttonAnim }] }]}>
          <LinearGradient colors={["#c6c6c6", "#fbf9f9"]} start={[0, 0]} end={[1, 1]} style={styles.button}>
            <Text style={styles.buttonText}>{text}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay for readability
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  animatedButton: {
    width: 260,
    borderRadius: 12,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#1E3C72",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
});

