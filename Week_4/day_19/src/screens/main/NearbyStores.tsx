// src/screens/main/NearbyStores.tsx - FIXED VERSION
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
import { locationService, Location, StoreLocation } from '../../services/locationService';
import Icon from 'react-native-vector-icons/FontAwesome';

// TAMBAH: Extended interface untuk store dengan distance
interface StoreWithDistance extends StoreLocation {
  distance: number;
  distanceText: string;
}

// Sample store data
const SAMPLE_STORES: StoreLocation[] = [
  {
    id: '1',
    name: 'Toko Utama E-Commerce',
    latitude: -6.2088,
    longitude: 106.8456,
    address: 'Jl. Sudirman No. 123, Jakarta'
  },
  {
    id: '2',
    name: 'Cabang Senayan',
    latitude: -6.2275,
    longitude: 106.8005,
    address: 'Mall Senayan City, Jakarta'
  },
  {
    id: '3',
    name: 'Cabang Kuningan',
    latitude: -6.2295,
    longitude: 106.8222,
    address: 'Kuningan City, Jakarta'
  },
];

export default function NearbyStores() {
  const { addVisitedScreen } = useUserStats();
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyStores, setNearbyStores] = useState<StoreWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{available: boolean; message: string} | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen('Nearby Stores');
      
      // Check location services status saat screen focus
      checkLocationStatus();
    }, [addVisitedScreen])
  );

  // TAMBAH: Check location services status
  const checkLocationStatus = async () => {
    try {
      const status = await locationService.checkLocationServices();
      setLocationStatus(status);
      
      if (!status.available) {
        console.log('📍 Location services status:', status.message);
      }
    } catch (error) {
      console.error('❌ Error checking location status:', error);
    }
  };

  const findNearbyStores = async () => {
    try {
      setLoading(true);
      
      // TAMBAH: Check location status dulu
      await checkLocationStatus();
      
      // 1. Minta izin lokasi dan dapatkan lokasi user
      const location = await locationService.getCurrentLocationForShipping();
      setUserLocation(location);
      
      // 2. Hitung jarak ke semua toko
      const storesWithDistance: StoreWithDistance[] = SAMPLE_STORES.map(store => {
        const distance = locationService.calculateDistance(
          location.latitude,
          location.longitude,
          store.latitude,
          store.longitude
        );
        
        return {
          ...store,
          distance,
          distanceText: distance < 1000 
            ? `${Math.round(distance)} m` 
            : `${(distance / 1000).toFixed(1)} km`
        };
      });

      // 3. Urutkan berdasarkan jarak terdekat
      const sortedStores = storesWithDistance.sort((a, b) => a.distance - b.distance);
      setNearbyStores(sortedStores);

      Alert.alert('Berhasil', `Menemukan ${sortedStores.length} toko terdekat`);

    } catch (error: any) {
      console.error('❌ Error finding nearby stores:', error);
      Alert.alert('Error', error.message || 'Gagal menemukan toko terdekat');
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingCost = async () => {
    try {
      setCalculatingShipping(true);
      
      // TAMBAH: Check location status dulu
      await checkLocationStatus();
      
      // 2. Optimasi Baterai (One-Time Fetch untuk Ongkir)
      const location = await locationService.getCurrentLocationForShipping();
      
      // Dapatkan alamat perkiraan
      const approximateAddress = await locationService.getApproximateAddress(location);
      
      // Simulasi perhitungan ongkir
      setTimeout(() => {
        const randomCost = Math.floor(Math.random() * 20000) + 5000;
        Alert.alert(
          'Ongkos Kirim',
          `Estimasi ongkir dari ${approximateAddress}: Rp ${randomCost.toLocaleString()}`,
          [{ text: 'OK' }]
        );
        setCalculatingShipping(false);
      }, 1500);

    } catch (error: any) {
      console.error('❌ Error calculating shipping:', error);
      Alert.alert('Error', error.message || 'Gagal menghitung ongkos kirim');
      setCalculatingShipping(false);
    }
  };

  const startPromoNotification = () => {
    const mainStore = SAMPLE_STORES[0]; // Toko Utama
    
    // TAMBAH: Check location status dulu
    checkLocationStatus().then(status => {
      if (!status?.available) {
        Alert.alert('Peringatan', 'Location services tidak tersedia untuk fitur promo');
        return;
      }
      
      // 5. Geofencing Sederhana (Promo Radius)
      locationService.startPromoGeofencing(mainStore, () => {
        Alert.alert(
          '🎉 PROMO DEKAT TOKO!',
          `Anda berada dalam radius 100m dari ${mainStore.name}. Dapatkan diskon 20% untuk pembelian pertama!`,
          [
            { 
              text: 'Lihat Promo', 
              onPress: () => console.log('Navigate to promo screen') 
            },
            { text: 'OK' }
          ]
        );
      });

      Alert.alert(
        'Notifikasi Promo Diaktifkan',
        `Anda akan mendapat notifikasi ketika berada dalam radius 100m dari ${mainStore.name}`
      );
    });
  };

  const sendAnalyticsLocation = async () => {
    try {
      // TAMBAH: Check location status dulu
      await checkLocationStatus();
      
      // 4. Integrasi Networking Hemat Data
      await locationService.sendLocationToServer();
      Alert.alert('Berhasil', 'Lokasi berhasil dikirim untuk analitik');
    } catch (error: any) {
      console.error('❌ Error sending analytics:', error);
      Alert.alert('Info', 'Lokasi analitik gagal dikirim: ' + error.message);
    }
  };

  // TAMBAH: Get location service status text
  const getStatusText = () => {
    if (!locationStatus) return 'Memeriksa status lokasi...';
    
    return locationStatus.available 
      ? '✅ ' + locationStatus.message
      : '❌ ' + locationStatus.message;
  };

  // TAMBAH: Get status color
  const getStatusColor = () => {
    if (!locationStatus) return '#666';
    return locationStatus.available ? '#28a745' : '#dc3545';
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkStatus />
      <Text style={styles.title}>📍 Toko Terdekat</Text>

      {/* Location Status */}
      {locationStatus && (
        <View style={[styles.statusSection, { borderLeftColor: getStatusColor() }]}>
          <Text style={styles.statusTitle}>Status Lokasi:</Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      )}

      {/* Location Actions */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={findNearbyStores}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="map-marker" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>
            {loading ? 'Mencari...' : 'Cari Toko Terdekat'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={calculateShippingCost}
          disabled={calculatingShipping}
        >
          {calculatingShipping ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Icon name="truck" size={18} color="#007AFF" />
          )}
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            {calculatingShipping ? 'Menghitung...' : 'Hitung Ongkir'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.promoButton]}
          onPress={startPromoNotification}
          disabled={!locationStatus?.available}
        >
          <Icon name="bell" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Aktifkan Notifikasi Promo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.analyticsButton]}
          onPress={sendAnalyticsLocation}
          disabled={!locationStatus?.available}
        >
          <Icon name="bar-chart" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Kirim Lokasi Analitik</Text>
        </TouchableOpacity>
      </View>

      {/* User Location Info */}
      {userLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>📍 Lokasi Anda Sekarang:</Text>
          <Text style={styles.locationText}>
            Latitude: {userLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {userLocation.longitude.toFixed(6)}
          </Text>
          {userLocation.accuracy && (
            <Text style={styles.accuracyText}>
              Akurasi: ±{userLocation.accuracy.toFixed(1)} meter
            </Text>
          )}
          {userLocation.speed && (
            <Text style={styles.speedText}>
              Kecepatan: {(userLocation.speed * 3.6).toFixed(1)} km/h
            </Text>
          )}
        </View>
      )}

      {/* Nearby Stores List */}
      {nearbyStores.length > 0 && (
        <View style={styles.storesSection}>
          <Text style={styles.sectionTitle}>🏪 Toko Terdekat:</Text>
          {nearbyStores.map((store) => (
            <View key={store.id} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeDistance}>{store.distanceText}</Text>
              </View>
              <Text style={styles.storeAddress}>{store.address}</Text>
              <Text style={styles.exactDistance}>
                📏 Jarak tepat: {Math.round(store.distance)} meter
              </Text>
              
              {store.distance < 100 && (
                <View style={styles.promoBadge}>
                  <Icon name="star" size={12} color="#fff" />
                  <Text style={styles.promoBadgeText}>Dalam Zona Promo!</Text>
                </View>
              )}
              
              {store.distance < 500 && store.distance >= 100 && (
                <View style={styles.nearbyBadge}>
                  <Icon name="map-marker" size={10} color="#fff" />
                  <Text style={styles.nearbyBadgeText}>Dekat</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* No Stores Found State */}
      {!loading && nearbyStores.length === 0 && userLocation && (
        <View style={styles.emptyState}>
          <Icon name="map" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>
            Tidak ada toko dalam radius 10km
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Coba cari di area yang lebih luas
          </Text>
        </View>
      )}

      {/* Information Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Cara Kerja Fitur Lokasi:</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Toko Terdekat</Text>: Menggunakan GPS akurat dengan timeout 10 detik
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Hitung Ongkir</Text>: Optimasi baterai dengan cache 1 menit
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Notifikasi Promo</Text>: Geofencing radius 100m, update setiap 50m
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Analitik</Text>: Hemat data dengan cache 2 menit
        </Text>
        
        {/* TAMBAH: Location Service Status */}
        <View style={styles.serviceStatus}>
          <Text style={styles.serviceStatusTitle}>Status Layanan:</Text>
          <Text style={styles.serviceStatusText}>
            Geolocation Available: {locationService.getStatus().isGeolocationAvailable ? '✅' : '❌'}
          </Text>
          <Text style={styles.serviceStatusText}>
            Tracking Active: {locationService.isTrackingActive() ? '✅' : '❌'}
          </Text>
        </View>
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
  statusSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionSection: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  promoButton: {
    backgroundColor: '#FF6B6B',
  },
  analyticsButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  accuracyText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
  },
  speedText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
    marginTop: 3,
  },
  storesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  storeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  storeDistance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 18,
  },
  exactDistance: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 3,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 8,
  },
  nearbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 3,
    marginTop: 8,
  },
  promoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nearbyBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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
  serviceStatus: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#b3e5fc',
  },
  serviceStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1565c0',
  },
  serviceStatusText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
});