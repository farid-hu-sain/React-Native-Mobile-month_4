import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import authUtils from '../../utils/auth';


export default function Onboarding2({ navigation }: any) {
  const handleStartShopping = () => {
    // Auto login jika belum login
    if (!authUtils.isAuthenticated()) {
      // Syntax yang benar untuk setToken - sesuaikan dengan implementasi authUtils Anda
      authUtils.setToken('user-token', {
        username: 'user123',
        email: 'user123@example.com',
        firstName: 'User',
        lastName: 'Demo',
        id: 1,
        gender: 'male',
        image: '',
        token: 'user-token'
      });
    }
    
    navigation.navigate('MainDrawer', { userID: 'U123' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeTitle}>Selamat Datang di</Text>
      <Text style={styles.appTitle}>Aplikasi E-Commerce v0.5</Text>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Mengapa belanja di aplikasi kami?</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🚚</Text>
          <Text style={styles.featureText}>Gratis Ongkir untuk pembelian di atas Rp 100.000</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💰</Text>
          <Text style={styles.featureText}>Harga terbaik dengan garansi 30 hari</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⭐</Text>
          <Text style={styles.featureText}>Produk berkualitas dari seller terpercaya</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureText}>Pembayaran aman & sistem perlindungan buyer</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStartShopping}
      >
        <Text style={styles.startButtonText}>Mulai Belanja Sekarang</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
    paddingVertical: 50,
    backgroundColor: '#fff',
  },
  welcomeTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 40,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  startButton: {
    width: '100%',
    padding: 18,
    backgroundColor: '#28a745',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});