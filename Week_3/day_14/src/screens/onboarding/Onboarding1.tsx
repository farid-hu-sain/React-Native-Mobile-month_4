import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authUtils } from '../../utils/auth';

export default function Onboarding1({ navigation }: any) {
  const handleLogin = () => {
    // Simulasi login sebagai user123
    authUtils.setToken('user-token', 'user123', 'user123@example.com');
    
    Alert.alert(
      "Login Berhasil",
      "Anda telah login sebagai user123",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate('MainDrawer', { userID: 'U123' })
        }
      ]
    );
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
          <Text style={styles.buttonText}>Login sebagai user123</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Onboarding2')}
        >
          <Text style={styles.secondaryButtonText}>Lanjut ke Onboarding 2</Text>
        </TouchableOpacity>
      </View>
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
});