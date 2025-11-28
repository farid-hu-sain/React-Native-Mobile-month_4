// src/components/AuthGuardTab.tsx (UPDATE)
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // UPDATE: Use AuthContext

interface AuthGuardTabProps {
  children: React.ReactNode;
}

export default function AuthGuardTab({ children }: AuthGuardTabProps) {
  const navigation = useNavigation<any>();
  const { isAuthenticated, demoLogin } = useAuth(); // UPDATE: Use AuthContext

  // UPDATE: Use isAuthenticated from AuthContext instead of authUtils
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Login Required</Text>
        <Text style={styles.message}>
          Silakan login terlebih dahulu untuk mengakses fitur ini
        </Text>
        <Button 
          title="Login Sekarang" 
          onPress={demoLogin} // UPDATE: Use demoLogin from AuthContext
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
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'center'
  }
});