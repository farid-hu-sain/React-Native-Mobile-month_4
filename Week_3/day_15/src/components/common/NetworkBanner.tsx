// src/components/common/NetworkBanner.tsx (REVERT dengan improvement)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNetwork } from '../../context/NetworkContext';

const NetworkBanner: React.FC = () => {
  const { netInfo, hasCheckedConnection, showGlobalBanner } = useNetwork();

  const getConnectionTypeText = () => {
    switch (netInfo.type) {
      case 'wifi':
        return 'WiFi';
      case 'cellular':
        return 'Cellular';
      case 'ethernet':
        return 'Ethernet';
      case 'bluetooth':
        return 'Bluetooth';
      case 'vpn':
        return 'VPN';
      case 'other':
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  // Show nothing while checking initial connection
  if (!hasCheckedConnection) {
    return null;
  }

  // NEW: Jika global banner aktif (offline), jangan tampilkan banner detail
  if (showGlobalBanner) {
    return null;
  }

  // Show offline banner if no internet (fallback - seharusnya sudah ditangani oleh global banner)
  if (netInfo.isInternetReachable === false) {
    return (
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>📶 Anda sedang Offline - Cek koneksi Anda</Text>
        <View style={styles.connectionDetails}>
          <Text style={styles.connectionDetailText}>
            Tipe: {getConnectionTypeText()} | Status: Offline
          </Text>
        </View>
      </View>
    );
  }

  // Show online indicator (normal operation)
  return (
    <View style={styles.onlineBanner}>
      <Text style={styles.onlineText}>
        📶 {getConnectionTypeText()} | Online
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FF4757',
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  onlineBanner: {
    backgroundColor: '#51CF66',
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#40C057',
  },
  onlineText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  connectionDetails: {
    marginTop: 4,
  },
  connectionDetailText: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
});

export default NetworkBanner;