// src/components/common/GlobalNetworkBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../../context/NetworkContext';

const GlobalNetworkBanner: React.FC = () => {
  const { showGlobalBanner, hasCheckedConnection } = useNetwork();

  if (!hasCheckedConnection || !showGlobalBanner) {
    return null;
  }

  return (
    <View style={styles.banner} testID="global-network-banner">
      <Text style={styles.bannerText}>📶 Koneksi terputus. Menggunakan mode offline.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FF4757',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default GlobalNetworkBanner;