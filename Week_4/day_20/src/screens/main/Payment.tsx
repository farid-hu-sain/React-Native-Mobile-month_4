// src/screens/main/Payment.tsx - FULL VERSION WITH BIOMETRIC
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import NetworkStatus from "../../components/common/NetworkStatus";
import { biometricService } from "../../services/biometricService";

const paymentMethods = [
  { id: "bank", name: "Transfer Bank", icon: "🏦" },
  { id: "credit", name: "Kartu Kredit", icon: "💳" },
  { id: "paypal", name: "PayPal", icon: "🔵" },
  { id: "dana", name: "DANA", icon: "💜" },
  { id: "gopay", name: "GoPay", icon: "🟢" },
  { id: "ovo", name: "OVO", icon: "🟣" },
];

export default function Payment({ route }: any) {
  const navigation = useNavigation<any>();
  const { clearCart, getTotalPrice, cartItems } = useCart();
  const { orderData } = route.params;
  const { biometricType, isBiometricAvailable } = useAuth();
  
  const [selectedMethod, setSelectedMethod] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // TAMBAH: Handle payment dengan biometric confirmation
  const handlePaymentWithBiometric = async () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Pilih metode pembayaran terlebih dahulu!");
      return;
    }

    setProcessingPayment(true);

    try {
      const amount = getTotalPrice();
      
      // Check biometric availability
      const { available, error, code } = await biometricService.isSensorAvailable();
      
      if (!available) {
        // Handle "Not Enrolled" case for transactions
        if (code === 'NOT_ENROLLED' || error?.includes('Not enrolled')) {
          Alert.alert(
            'Autentikasi Biometrik Belum Tersedia',
            'Silakan atur biometrik di Settings atau gunakan konfirmasi manual.',
            [
              { 
                text: 'Konfirmasi Manual', 
                onPress: () => processPaymentManual(amount)
              },
              { text: 'Batal', onPress: () => setProcessingPayment(false) }
            ]
          );
          return;
        }
        
        // Fallback to manual confirmation if biometric not available
        processPaymentManual(amount);
        return;
      }

      // Get dynamic prompt message for transaction
      const promptMessage = biometricService.getPromptMessage(biometricType, 'transaction', amount);
      
      // Show biometric prompt for confirmation
      const result = await biometricService.simplePrompt({
        promptMessage,
        cancelButtonText: 'Batalkan Transaksi'
      });

      if (result.success) {
        // Biometric confirmation successful - process payment
        await processPayment(amount);
      } else {
        // Handle biometric failure
        if (result.code === 'LOCKOUT') {
          await biometricService.handleBiometricLockout();
          Alert.alert(
            "Transaksi Dibatalkan", 
            "Sensor terkunci. Silakan coba lagi nanti.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Transaksi Dibatalkan", 
            "Konfirmasi biometrik gagal atau dibatalkan.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Payment with biometric failed:', error);
      Alert.alert("Error", "Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setProcessingPayment(false);
    }
  };

  // TAMBAH: Process payment setelah konfirmasi berhasil
  const processPayment = async (amount: number) => {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      
      Alert.alert(
        "Pembayaran Berhasil!",
        `Pembayaran sebesar Rp${amount.toLocaleString("id-ID")} berhasil diproses. Pesanan Anda sedang diproses.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      throw error;
    }
  };

  // TAMBAH: Manual payment confirmation (fallback)
  const processPaymentManual = (amount: number) => {
    Alert.alert(
      "Konfirmasi Pembayaran Manual",
      `Anda akan melakukan pembayaran sebesar Rp${amount.toLocaleString("id-ID")} menggunakan ${paymentMethods.find(m => m.id === selectedMethod)?.name}`,
      [
        { text: "Batal", style: "cancel", onPress: () => setProcessingPayment(false) },
        { 
          text: "Konfirmasi", 
          onPress: () => processPayment(amount)
        },
      ]
    );
  };

  // UPDATE: Handle payment function
  const handlePayment = () => {
    // Gunakan biometric confirmation jika available, else manual
    if (isBiometricAvailable) {
      handlePaymentWithBiometric();
    } else {
      const amount = getTotalPrice();
      processPaymentManual(amount);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkStatus />
      <Text style={styles.title}>💳 Metode Pembayaran</Text>

      {/* TAMBAH: Biometric Info Banner */}
      {isBiometricAvailable && (
        <View style={styles.biometricBanner}>
          <Text style={styles.biometricBannerText}>
            🔒 Transaksi ini akan dikonfirmasi dengan {biometricType} untuk keamanan
          </Text>
        </View>
      )}

      <View style={styles.orderSummary}>
        <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
        <Text>Total Item: {cartItems.length}</Text>
        <Text style={styles.totalPrice}>
          Total: Rp{getTotalPrice().toLocaleString("id-ID")}
        </Text>
      </View>

      <View style={styles.paymentMethods}>
        <Text style={styles.sectionTitle}>Pilih Metode Pembayaran</Text>
        
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodItem,
              selectedMethod === method.id && styles.selectedMethod,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <Text style={styles.methodName}>{method.name}</Text>
            <View style={[
              styles.radio,
              selectedMethod === method.id && styles.radioSelected,
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.addressInfo}>
        <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
        <Text>{orderData.address.fullName}</Text>
        <Text>{orderData.address.phone}</Text>
        <Text>{orderData.address.detail}</Text>
        <Text>
          {orderData.address.city}, {orderData.address.province} {orderData.address.postalCode}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.payButton,
            (!selectedMethod || processingPayment) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedMethod || processingPayment}
        >
          {processingPayment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              {isBiometricAvailable ? '🔒 ' : ''}
              Bayar Rp{getTotalPrice().toLocaleString("id-ID")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  biometricBanner: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  biometricBannerText: {
    color: '#1565C0',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  orderSummary: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 5,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedMethod: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  methodName: {
    flex: 1,
    fontSize: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  radioSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  addressInfo: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#6c757d",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  payButton: {
    flex: 2,
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonDisabled: {
    backgroundColor: "#ccc",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});