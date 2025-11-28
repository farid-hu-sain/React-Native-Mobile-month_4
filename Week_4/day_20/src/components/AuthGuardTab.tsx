// src/components/AuthGuardTab.tsx (FIXED VERSION)
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTokenManagement } from '../hooks/useAuth';
import { authUtils } from '../utils/auth';

interface AuthGuardTabProps {
  children: React.ReactNode;
}

export default function AuthGuardTab({ children }: AuthGuardTabProps) {
  const navigation = useNavigation<any>();
  const { isAuthenticated, demoLogin, isLoading } = useAuth();
  const { isTokenValid, remainingTime } = useTokenManagement();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (isAuthenticated) {
        setIsCheckingToken(true);
        try {
          await authUtils.validateTokenAndRedirect(navigation);
        } catch (error) {
          console.error('Token validation in AuthGuardTab failed:', error);
        } finally {
          setIsCheckingToken(false);
        }
      } else {
        setIsCheckingToken(false);
      }
    };

    checkTokenValidity();
  }, [isAuthenticated, navigation]);

  if (isLoading || isCheckingToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memeriksa autentikasi...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !isTokenValid) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Login Required</Text>
        <Text style={styles.message}>
          {!isAuthenticated 
            ? "Silakan login terlebih dahulu untuk mengakses fitur ini" 
            : "Session telah expired, silakan login ulang"
          }
        </Text>
        
        {isAuthenticated && !isTokenValid && (
          <Text style={styles.expiredText}>
            Token expired. Sisa waktu: {remainingTime}
          </Text>
        )}
        
        <Button 
          title="Login Sekarang" 
          onPress={demoLogin}
          color="#007AFF"
        />
        <Text style={styles.note}>
          Atau login melalui menu Profile
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10,
    textAlign: 'center'
  },
  message: { 
    fontSize: 16, 
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    color: '#666'
  },
  expiredText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: 'center'
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'center'
  }
});