// src/screens/main/CourierTracking.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useUserStats } from '../../context/UserStatsContext';
import NetworkStatus from '../../components/common/NetworkStatus';
import { locationService, Location } from '../../services/locationService';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function CourierTracking() {
  const { addVisitedScreen } = useUserStats();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen('Courier Tracking');
      
      // Cleanup ketika keluar dari screen
      return () => {
        if (isTracking) {
          locationService.stopLiveTracking();
          console.log('🧹 Courier tracking cleaned up on unmount');
        }
      };
    }, [addVisitedScreen, isTracking])
  );

  const startTracking = () => {
    setLoading(true);
    
    // 3. Live Tracking & Cleanup untuk Kurir
    locationService.startLiveTracking(
      (location) => {
        setCurrentLocation(location);
        setLocationHistory(prev => [...prev.slice(-9), location]); // Simpan 10 lokasi terakhir
        setIsTracking(true);
        setLoading(false);
        
        console.log('📍 Tracking update received:', location);
      },
      (error) => {
        console.error('❌ Tracking error:', error);
        Alert.alert('Error', 'Gagal memulai tracking: ' + error.message);
        setIsTracking(false);
        setLoading(false);
      }
    );
  };

  const stopTracking = () => {
    locationService.stopLiveTracking();
    setIsTracking(false);
    Alert.alert('Info', 'Live tracking dihentikan');
  };

  const simulateCourierMovement = () => {
    if (!currentLocation) return;

    // Simulasi pergerakan kurir
    const newLocation: Location = {
      latitude: currentLocation.latitude + 0.0001,
      longitude: currentLocation.longitude + 0.0001,
      accuracy: currentLocation.accuracy,
      speed: 5 + Math.random() * 10, // 5-15 km/h
      heading: Math.random() * 360,
    };

    setCurrentLocation(newLocation);
    setLocationHistory(prev => [...prev.slice(-9), newLocation]);
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkStatus />
      <Text style={styles.title}>🚚 Live Tracking Kurir</Text>

      {/* Tracking Controls */}
      <View style={styles.controlSection}>
        <TouchableOpacity 
          style={[styles.controlButton, isTracking ? styles.stopButton : styles.startButton]}
          onPress={isTracking ? stopTracking : startTracking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon 
              name={isTracking ? 'stop' : 'play'} 
              size={20} 
              color="#fff" 
            />
          )}
          <Text style={styles.controlButtonText}>
            {loading ? 'Memulai...' : isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        {isTracking && (
          <TouchableOpacity 
            style={[styles.controlButton, styles.simulateButton]}
            onPress={simulateCourierMovement}
          >
            <Icon name="random" size={18} color="#fff" />
            <Text style={styles.controlButtonText}>Simulasi Pergerakan</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Current Location Display */}
      {currentLocation && (
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>📍 Lokasi Kurir Saat Ini:</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Latitude:</Text>
              <Text style={styles.locationValue}>
                {currentLocation.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Longitude:</Text>
              <Text style={styles.locationValue}>
                {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
            {currentLocation.accuracy && (
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Akurasi:</Text>
                <Text style={styles.locationValue}>
                  ±{currentLocation.accuracy.toFixed(1)} meter
                </Text>
              </View>
            )}
            {currentLocation.speed && (
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Kecepatan:</Text>
                <Text style={styles.locationValue}>
                  {(currentLocation.speed * 3.6).toFixed(1)} km/h
                </Text>
              </View>
            )}
            {currentLocation.heading && (
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Arah:</Text>
                <Text style={styles.locationValue}>
                  {Math.round(currentLocation.heading)}°
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Location History */}
      {locationHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>📊 Riwayat Lokasi (10 Terakhir):</Text>
          {locationHistory.slice().reverse().map((location, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText}>
                {locationHistory.length - index}. {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              {location.speed && (
                <Text style={styles.historySpeed}>
                  {(location.speed * 3.6).toFixed(1)} km/h
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Tracking Status */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, isTracking ? styles.statusActive : styles.statusInactive]} />
          <Text style={styles.statusText}>
            Status: {isTracking ? 'LIVE TRACKING AKTIF' : 'TIDAK AKTIF'}
          </Text>
        </View>
        
        {isTracking && (
          <Text style={styles.trackingInfo}>
            🔄 Update setiap 20 meter • 📍 High accuracy • 🛑 Auto-cleanup saat keluar
          </Text>
        )}
      </View>

      {/* Information */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Fitur Live Tracking:</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Distance Filter</Text>: Update setiap 20 meter
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Auto Cleanup</Text>: Tracking berhenti otomatis saat keluar layar
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>High Accuracy</Text>: GPS akurat untuk navigasi
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Battery Optimized</Text>: Stop otomatis mencegah drain baterai
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  controlSection: {
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  simulateButton: {
    backgroundColor: '#6f42c1',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  locationCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationValue: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  historySection: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    flex: 1,
  },
  historySpeed: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  statusSection: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#28a745',
  },
  statusInactive: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  trackingInfo: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1565c0',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});