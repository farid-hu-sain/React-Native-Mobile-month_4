import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import NetworkStatus from "../../components/common/NetworkStatus";


export default function AddressForm() {
  const navigation = useNavigation<any>();
  const { getTotalPrice } = useCart();
  
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    province: "",
    city: "",
    postalCode: "",
    detail: "",
  });

  const handleSubmit = () => {
    // Validasi form
    if (!address.fullName || !address.phone || !address.province || 
        !address.city || !address.postalCode || !address.detail) {
      Alert.alert("Error", "Semua field harus diisi!");
      return;
    }

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(address.phone)) {
      Alert.alert("Error", "Nomor telepon harus antara 10-13 digit angka");
      return;
    }

    const orderData = {
      address,
      total: getTotalPrice(),
      timestamp: new Date().toISOString(),
    };

    navigation.navigate("Payment", { orderData });
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkStatus />
      <Text style={styles.title}>📦 Alamat Pengiriman</Text>
      
      <View style={styles.form}>
        <TextInput
          placeholder="Nama Lengkap *"
          style={styles.input}
          value={address.fullName}
          onChangeText={(text) => setAddress({...address, fullName: text})}
        />
        
        <TextInput
          placeholder="Nomor Telepon *"
          style={styles.input}
          value={address.phone}
          onChangeText={(text) => setAddress({...address, phone: text})}
          keyboardType="phone-pad"
        />
        
        <TextInput
          placeholder="Provinsi *"
          style={styles.input}
          value={address.province}
          onChangeText={(text) => setAddress({...address, province: text})}
        />
        
        <TextInput
          placeholder="Kota/Kabupaten *"
          style={styles.input}
          value={address.city}
          onChangeText={(text) => setAddress({...address, city: text})}
        />
        
        <TextInput
          placeholder="Kode Pos *"
          style={styles.input}
          value={address.postalCode}
          onChangeText={(text) => setAddress({...address, postalCode: text})}
          keyboardType="numeric"
        />
        
        <TextInput
          placeholder="Alamat Lengkap (Jalan, No. Rumah, RT/RW) *"
          style={[styles.input, styles.textArea]}
          value={address.detail}
          onChangeText={(text) => setAddress({...address, detail: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Kembali ke Keranjang"
          onPress={() => navigation.goBack()}
          color="#6c757d"
        />
        <Button
          title="Lanjut ke Pembayaran"
          onPress={handleSubmit}
          color="#007AFF"
        />
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
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
});