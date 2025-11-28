// src/components/AuthGuard.tsx (FIXED VERSION)
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTokenManagement } from '../hooks/useAuth';
import { authUtils } from '../utils/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  navigation?: any;
}

export default function AuthGuard({ children, fallback, navigation }: AuthGuardProps) {
  const { isAuthenticated, demoLogin, isLoading } = useAuth();
  const { isTokenValid, remainingTime } = useTokenManagement();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (isAuthenticated && navigation) {
        setIsCheckingToken(true);
        try {
          await authUtils.validateTokenAndRedirect(navigation);
        } catch (error) {
          console.error('Token validation in AuthGuard failed:', error);
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
    return fallback || (
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Authentication Required</Text>
        <Text style={styles.message}>
          {!isAuthenticated 
            ? "Harap Login untuk mengakses" 
            : "Session telah expired, harap login ulang"
          }
        </Text>
        
        {isAuthenticated && !isTokenValid && (
          <Text style={styles.expiredText}>
            Token expired. Sisa waktu: {remainingTime}
          </Text>
        )}
        
        <Button 
          title="Login Simulasi" 
          onPress={demoLogin}
        />
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
    padding: 20 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  message: { 
    fontSize: 16, 
    textAlign: 'center',
    marginBottom: 20 
  },
  expiredText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: 'center'
  }
});