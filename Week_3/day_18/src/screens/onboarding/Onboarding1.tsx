// src/screens/onboarding/Onboarding1.tsx - ENHANCED VERSION
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { deepLinkingService } from '../../services/deepLinkingService';

export default function Onboarding1({ navigation, route }: any) {
  const { demoLogin } = useAuth();

  // TAMBAH: Handle pending deep link setelah login
  useEffect(() => {
    // Cek jika ada pending deep link dari route params
    const pendingDeepLink = route.params?.pendingDeepLink;
    if (pendingDeepLink) {
      console.log('🔗 Pending deep link detected:', pendingDeepLink);
      Alert.alert(
        'Login Diperlukan',
        `Anda harus login terlebih dahulu untuk mengakses: ${pendingDeepLink.action}`,
        [{ text: 'Mengerti' }]
      );
    }
  }, [route.params]);

  const handleLogin = async () => {
    try {
      await demoLogin();
      
      // TAMBAH: Execute pending deep link setelah login berhasil
      const hasPendingLink = await deepLinkingService.executePendingDeepLinkAfterLogin();
      
      if (hasPendingLink) {
        console.log('✅ Login successful, pending deep link executed');
        Alert.alert(
          "Login Berhasil",
          "Anda telah login dan dialihkan ke halaman tujuan.",
          [{ text: "OK" }]
        );
      } else {
        console.log('✅ Login successful, navigating to home');
        Alert.alert(
          "Login Berhasil",
          "Anda telah login sebagai demo_user",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('MainDrawer', { userID: 'U123' })
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("Login Gagal", "Terjadi kesalahan saat login");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍️ E-Commerce App</Text>
      <Text style={styles.subtitle}>Temukan produk terbaik dengan harga terbaik</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login sebagai Demo User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Onboarding2')}
        >
          <Text style={styles.secondaryButtonText}>Lanjut ke Onboarding 2</Text>
        </TouchableOpacity>
      </View>

      {/* TAMBAH: Info tentang pending deep link */}
      {route.params?.pendingDeepLink && (
        <View style={styles.pendingLinkInfo}>
          <Text style={styles.pendingLinkText}>
            🔗 Setelah login, Anda akan dialihkan ke: {route.params.pendingDeepLink.action}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // TAMBAH: Styles untuk pending link info
  pendingLinkInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  pendingLinkText: {
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
    lineHeight: 18,
  },
});