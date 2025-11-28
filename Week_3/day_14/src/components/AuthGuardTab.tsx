import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthGuard from './AuthGuard';

interface AuthGuardTabProps {
  children: React.ReactNode;
}

export default function AuthGuardTab({ children }: AuthGuardTabProps) {
  const navigation = useNavigation<any>();

  return (
    <AuthGuard 
      fallback={
        <View style={styles.container}>
          <Text style={styles.title}>🔐 Login Required</Text>
          <Text style={styles.message}>
            Silakan login terlebih dahulu untuk mengakses kategori produk
          </Text>
          <Button 
            title="Login Sekarang" 
            onPress={() => navigation.navigate('Profile')}
            color="#007AFF"
          />
        </View>
      }
    >
      {children}
    </AuthGuard>
  );
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
});