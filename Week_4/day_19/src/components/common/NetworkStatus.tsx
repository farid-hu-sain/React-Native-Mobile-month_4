import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNetwork } from '../../context/NetworkContext';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const NetworkStatus: React.FC = () => {
  const { netInfo, hasCheckedConnection } = useNetwork();

  const getConnectionTypeText = () => {
    switch (netInfo.type) {
      case 'wifi':
        return 'WiFi';
      case 'cellular':
        return 'Cellular Data';
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

  // Show full screen offline UI if no internet
  if (netInfo.isInternetReachable === false) {
    return (
      <View style={styles.offlineContainer}>
        <View style={styles.offlineContent}>
          <Icon name="wifi" size={80} color="#FF6B6B" />
          <Text style={styles.offlineTitle}>Tidak Ada Koneksi Internet</Text>
          <Text style={styles.offlineMessage}>
            Perangkat Anda tidak terhubung ke internet. 
            Silakan periksa koneksi WiFi atau data seluler Anda.
          </Text>
          
          <View style={styles.connectionDetails}>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Status: </Text>
              Offline
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Tipe Koneksi: </Text>
              {getConnectionTypeText()}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => window.location.reload()} // Simple reload
          >
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Return null when online (no overlay)
  return null;
};

const styles = StyleSheet.create({
  offlineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  offlineContent: {
    width: width * 0.8,
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  offlineMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  connectionDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 25,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#555',
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    gap: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NetworkStatus;