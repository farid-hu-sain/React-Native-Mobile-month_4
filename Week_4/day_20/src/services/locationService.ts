// src/services/locationService.ts - FIXED VERSION
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

// TAMBAH: Error types untuk Geolocation
interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
}

// TAMBAH: Extended Geolocation types
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

// TAMBAH: Deklarasi global untuk navigator.geolocation
declare global {
  interface Navigator {
    geolocation: {
      getCurrentPosition: (
        success: (position: GeolocationPosition) => void,
        error: (error: GeolocationError) => void,
        options?: any
      ) => void;
      watchPosition: (
        success: (position: GeolocationPosition) => void,
        error: (error: GeolocationError) => void,
        options?: any
      ) => number;
      clearWatch: (watchId: number) => void;
    };
  }
}

class LocationService {
  private watchId: number | null = null;
  private isTracking = false;

  // TAMBAH: Cek ketersediaan geolocation
  private isGeolocationAvailable(): boolean {
    return !!(navigator && navigator.geolocation);
  }

  // TAMBAH: Error constants untuk konsistensi
  private readonly ERROR_CODES = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3
  };

  // 1. Izin Lokasi dengan Penjelasan (Rationale)
  async requestLocationPermission(): Promise<boolean> {
    // TAMBAH: Cek ketersediaan geolocation dulu
    if (!this.isGeolocationAvailable()) {
      console.error('❌ Geolocation not available');
      Alert.alert('Error', 'Geolocation tidak tersedia di perangkat ini');
      return false;
    }

    if (Platform.OS !== 'android') {
      console.log('📍 Location permission always granted on iOS');
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Izin Akses Lokasi',
          message: 'Kami butuh lokasi Anda untuk menampilkan toko terdekat secara akurat dan menghitung ongkos kirim.',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Tolak',
          buttonNeutral: 'Nanti Saja',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Location permission granted');
        return true;
      } else {
        console.log('❌ Location permission denied');
        Alert.alert(
          'Izin Lokasi Ditolak',
          'Beberapa fitur seperti toko terdekat dan perhitungan ongkir tidak akan bekerja optimal tanpa izin lokasi.'
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      return false;
    }
  }

  // 2. Optimasi Baterai (One-Time Fetch untuk Ongkir)
  async getCurrentLocationForShipping(): Promise<Location> {
    return new Promise(async (resolve, reject) => {
      // TAMBAH: Cek ketersediaan geolocation
      if (!this.isGeolocationAvailable()) {
        reject(new Error('Geolocation tidak tersedia'));
        return;
      }

      // Cek izin dulu
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        reject(new Error('Location permission denied'));
        return;
      }

      const options = {
        enableHighAccuracy: true, // Agar akurat untuk perhitungan ongkir
        timeout: 10000, // 10 detik batas waktu
        maximumAge: 60000, // Gunakan cache jika umur lokasi < 1 menit
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };
          console.log('📍 Current location fetched for shipping:', location);
          resolve(location);
        },
        (error: GeolocationError) => {
          console.error('❌ Error getting current location:', error);
          
          // FIX: Gunakan ERROR_CODES yang konsisten
          switch (error.code) {
            case this.ERROR_CODES.PERMISSION_DENIED:
              reject(new Error('Izin lokasi ditolak'));
              break;
            case this.ERROR_CODES.POSITION_UNAVAILABLE:
              reject(new Error('Lokasi tidak tersedia'));
              break;
            case this.ERROR_CODES.TIMEOUT:
              Alert.alert(
                'GPS Timeout',
                'Periksa koneksi GPS Anda. Pastikan GPS aktif dan coba lagi.'
              );
              reject(new Error('Timeout mendapatkan lokasi'));
              break;
            default:
              reject(new Error('Gagal mendapatkan lokasi'));
          }
        },
        options
      );
    });
  }

  // 3. Live Tracking & Cleanup untuk Kurir
  startLiveTracking(
    onLocationUpdate: (location: Location) => void,
    onError?: (error: any) => void
  ): void {
    // TAMBAH: Cek ketersediaan geolocation
    if (!this.isGeolocationAvailable()) {
      console.error('❌ Geolocation not available for live tracking');
      onError?.(new Error('Geolocation tidak tersedia'));
      return;
    }

    if (this.isTracking) {
      console.log('📍 Tracking already active');
      return;
    }

    this.requestLocationPermission().then(hasPermission => {
      if (!hasPermission) {
        onError?.(new Error('Location permission denied'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        distanceFilter: 20, // Update setiap 20 meter
        timeout: 15000,
        maximumAge: 5000,
      };

      try {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              heading: position.coords.heading || undefined,
            };
            
            console.log('🚚 Live tracking update:', location);
            this.isTracking = true;
            onLocationUpdate(location);
          },
          (error: GeolocationError) => {
            console.error('❌ Live tracking error:', error);
            this.isTracking = false;
            onError?.(error);
          },
          options
        );

        console.log('📍 Live tracking started with ID:', this.watchId);
      } catch (error) {
        console.error('❌ Error starting live tracking:', error);
        onError?.(error);
      }
    });
  }

  stopLiveTracking(): void {
    if (this.watchId !== null) {
      try {
        navigator.geolocation.clearWatch(this.watchId);
        console.log('🛑 Live tracking stopped');
      } catch (error) {
        console.error('❌ Error stopping live tracking:', error);
      } finally {
        this.watchId = null;
        this.isTracking = false;
      }
    }
  }

  // 4. Integrasi Networking Hemat Data
  async sendLocationToServer(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // TAMBAH: Cek ketersediaan geolocation
      if (!this.isGeolocationAvailable()) {
        reject(new Error('Geolocation tidak tersedia'));
        return;
      }

      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        reject(new Error('Location permission denied'));
        return;
      }

      const options = {
        enableHighAccuracy: false, // Tidak perlu akurat untuk analytics
        timeout: 8000,
        maximumAge: 120000, // 2 menit - Gunakan cache untuk hemat baterai & data
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const location: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };

            // maximumAge: 120000 membantu mengurangi beban server dan baterai dengan:
            // - Tidak mengambil data GPS baru jika data cache berumur < 2 menit masih tersedia
            // - Mengurangi frekuensi request GPS yang boros baterai
            // - Mengurangi spam data ke server dengan lokasi yang sama
            console.log('📡 Sending location to server (with maximumAge optimization):', location);
            
            // Simulasi API call
            await this.simulateServerCall(location);
            
            console.log('✅ Location sent to server successfully');
            resolve();
          } catch (error) {
            console.error('❌ Error sending location to server:', error);
            reject(error);
          }
        },
        (error: GeolocationError) => {
          console.error('❌ Error getting location for server:', error);
          reject(error);
        },
        options
      );
    });
  }

  private async simulateServerCall(location: Location): Promise<void> {
    // Simulasi API call delay
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('📊 Server: Location analytics processed', location);
        resolve();
      }, 500);
    });
  }

  // 5. Geofencing Sederhana (Promo Radius)
  startPromoGeofencing(
    storeLocation: StoreLocation,
    onEnterPromoZone: () => void
  ): void {
    // TAMBAH: Cek ketersediaan geolocation
    if (!this.isGeolocationAvailable()) {
      console.error('❌ Geolocation not available for geofencing');
      Alert.alert('Error', 'Geolocation tidak tersedia untuk fitur promo radius');
      return;
    }

    if (this.isTracking) {
      console.log('📍 Geofencing already active');
      return;
    }

    this.requestLocationPermission().then(hasPermission => {
      if (!hasPermission) {
        Alert.alert('Info', 'Izin lokasi diperlukan untuk fitur promo radius');
        return;
      }

      const options = {
        enableHighAccuracy: true,
        distanceFilter: 50, // Update setiap 50 meter
        timeout: 10000,
        maximumAge: 30000,
      };

      try {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const userLocation: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };

            const distance = this.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              storeLocation.latitude,
              storeLocation.longitude
            );

            console.log(`📍 Distance to store: ${distance.toFixed(2)} meters`);

            if (distance < 100) { // Dalam radius 100 meter
              console.log('🎉 User entered promo zone!');
              onEnterPromoZone();
              this.stopLiveTracking(); // Matikan tracking setelah promo terpicu
            }
          },
          (error: GeolocationError) => {
            console.error('❌ Geofencing error:', error);
          },
          options
        );

        console.log('📍 Promo geofencing started for store:', storeLocation.name);
      } catch (error) {
        console.error('❌ Error starting geofencing:', error);
        Alert.alert('Error', 'Gagal memulai fitur promo radius');
      }
    });
  }

  // Hitung jarak antara dua koordinat (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius bumi dalam meter
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // TAMBAH: Get approximate address dari coordinates (reverse geocoding sederhana)
  async getApproximateAddress(location: Location): Promise<string> {
    try {
      // Simulasi reverse geocoding
      // Di production, gunakan service seperti Google Maps Geocoding API
      return new Promise(resolve => {
        setTimeout(() => {
          const addresses = [
            'Jl. Sudirman, Jakarta Pusat',
            'Jl. Thamrin, Jakarta Pusat', 
            'Jl. Gatot Subroto, Jakarta Selatan',
            'Jl. HR Rasuna Said, Kuningan',
            'Jl. Asia Afrika, Bandung'
          ];
          const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
          resolve(`${randomAddress} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`);
        }, 1000);
      });
    } catch (error) {
      console.error('❌ Error getting approximate address:', error);
      return `Lokasi: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
  }

  // TAMBAH: Check jika location services enabled
  async checkLocationServices(): Promise<{available: boolean; message: string}> {
    if (!this.isGeolocationAvailable()) {
      return {
        available: false,
        message: 'Geolocation tidak tersedia di perangkat ini'
      };
    }

    try {
      // Test dengan timeout pendek
      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve({
            available: false,
            message: 'GPS tidak merespon, pastikan GPS aktif'
          });
        }, 3000);

        navigator.geolocation.getCurrentPosition(
          () => {
            clearTimeout(timeoutId);
            resolve({
              available: true,
              message: 'Location services aktif dan siap'
            });
          },
          (error) => {
            clearTimeout(timeoutId);
            let message = 'Location services tidak tersedia';
            
            switch (error.code) {
              case this.ERROR_CODES.PERMISSION_DENIED:
                message = 'Izin lokasi ditolak';
                break;
              case this.ERROR_CODES.POSITION_UNAVAILABLE:
                message = 'GPS tidak aktif atau sinyal lemah';
                break;
              case this.ERROR_CODES.TIMEOUT:
                message = 'GPS timeout, periksa koneksi';
                break;
            }
            
            resolve({ available: false, message });
          },
          { timeout: 2500, maximumAge: 0 }
        );
      });
    } catch (error) {
      return {
        available: false,
        message: 'Error checking location services'
      };
    }
  }

  // Utility methods
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  getCurrentWatchId(): number | null {
    return this.watchId;
  }

  // TAMBAH: Get service status
  getStatus(): {
    isGeolocationAvailable: boolean;
    isTracking: boolean;
    watchId: number | null;
  } {
    return {
      isGeolocationAvailable: this.isGeolocationAvailable(),
      isTracking: this.isTracking,
      watchId: this.watchId
    };
  }

  // Cleanup
  cleanup(): void {
    this.stopLiveTracking();
    console.log('🧹 Location service cleaned up');
  }
}

export const locationService = new LocationService();