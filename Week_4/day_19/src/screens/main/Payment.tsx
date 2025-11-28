import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import NetworkStatus from "../../components/common/NetworkStatus";


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
  
  const [selectedMethod, setSelectedMethod] = useState("");

  const handlePayment = () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Pilih metode pembayaran terlebih dahulu!");
      return;
    }

    Alert.alert(
      "Konfirmasi Pembayaran",
      `Anda akan melakukan pembayaran sebesar Rp${getTotalPrice().toLocaleString("id-ID")} menggunakan ${paymentMethods.find(m => m.id === selectedMethod)?.name}`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Bayar", 
          onPress: () => {
            clearCart();
            Alert.alert(
              "Pembayaran Berhasil!",
              "Pesanan Anda sedang diproses. Terima kasih telah berbelanja!",
              [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("Home"),
                },
              ]
            );
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkStatus />
      <Text style={styles.title}>💳 Metode Pembayaran</Text>

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
            !selectedMethod && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedMethod}
        >
          <Text style={styles.payButtonText}>
            Bayar Rp{getTotalPrice().toLocaleString("id-ID")}
          </Text>
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