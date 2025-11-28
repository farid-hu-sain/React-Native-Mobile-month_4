// src/components/ProtectedRoute.tsx (FILE BARU)
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { authUtils } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  navigation: any;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, navigation, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        // Cek token di Keystore & validasi expired
        const isValid = await authService.isUserLoggedIn();
        setIsTokenValid(isValid);

        if (!isValid) {
          console.log('🔐 Token tidak valid, redirect ke login...');
          // Redirect ke LoginScreen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding1' }],
          });
        }
      } catch (error) {
        console.error('❌ Error checking token validity:', error);
        setIsTokenValid(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding1' }],
        });
      }
    };

    if (!isLoading) {
      checkTokenValidity();
    }
  }, [isLoading, navigation]);

  // Tampilkan loading selama checking auth
  if (isLoading || isTokenValid === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memeriksa autentikasi...</Text>
      </View>
    );
  }

  // Token tidak valid, tampilkan fallback atau redirect
  if (!isTokenValid || !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Mengarahkan ke login...</Text>
      </View>
    );
  }

  // Token valid, render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});