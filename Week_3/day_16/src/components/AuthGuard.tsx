// src/components/AuthGuard.tsx (UPDATE)
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext'; // NEW

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, demoLogin } = useAuth(); // NEW

  if (!isAuthenticated) {
    return fallback || (
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Authentication Required</Text>
        <Text style={styles.message}>Harap Login untuk mengakses</Text>
        <Button 
          title="Login Simulasi" 
          onPress={demoLogin} // UPDATED: Use context function
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
});