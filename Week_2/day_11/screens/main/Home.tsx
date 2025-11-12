import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Button } from "react-native";
import TopTabsNavigator from "../../components/navigation/TopTabsNavigator";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

export default function Home() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* CUSTOM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏠 Home</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("AddProduct" as never)}
          style={styles.addButton}
        >
          <Text style={styles.addIcon}>➕</Text>
        </TouchableOpacity>
      </View>
      
      {/* TOP TABS */}
      <View style={styles.tabsContainer}>
        <TopTabsNavigator />
      </View>

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddProduct" as never)}
      >
        <Text style={styles.floatingButtonText}>+ Add Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  addIcon: {
    fontSize: 18,
  },
  tabsContainer: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});