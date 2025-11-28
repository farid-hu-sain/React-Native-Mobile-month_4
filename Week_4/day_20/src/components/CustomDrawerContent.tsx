// src/components/CustomDrawerContent.tsx (UPDATED)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, isAuthenticated } = useAuth();

  const menuItems = [
    { label: '🏠 Home', route: 'MainTabs', icon: 'home' },
    { label: '📊 Statistik', route: 'UserStats', icon: 'bar-chart' },
    { label: '❤️ Wishlist', route: 'Wishlist', icon: 'heart' },
    { label: '⚙️ Settings', route: 'Settings', icon: 'cog' },
    // ✅ NEW LOCATION FEATURES
    { label: '📍 Toko Terdekat', route: 'NearbyStores', icon: 'map-marker' },
    { label: '🚚 Tracking Kurir', route: 'CourierTracking', icon: 'truck' },
    { label: '🚪 Logout', route: 'Logout', icon: 'sign-out' },
  ];

  const handleNavigation = (route: string) => {
    props.navigation.navigate(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>E-Commerce App</Text>
        <Text style={styles.headerSubtitle}>
          {isAuthenticated ? `Halo, ${user?.username || 'User'}` : 'Silakan login'}
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.route)}
          >
            <Icon name={item.icon as any} size={18} color="#007AFF" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0 • E-Commerce</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuIcon: {
    width: 24,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});