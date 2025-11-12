import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, Button, Alert } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

export default function ProductDetail({ route, navigation }: any) {
  const { productId, product } = route.params;

  // HANDLE JIKA PRODUCT TIDAK ADA
  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product tidak ditemukan</Text>
        <Button title="Kembali" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handleResetToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
    
    navigation.dispatch(DrawerActions.closeDrawer());
    Alert.alert("Success", "Navigasi direset ke Home dan Drawer ditutup");
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>Rp{product.price.toLocaleString("id-ID")}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="🔄 Reset ke Home & Tutup Drawer"
          onPress={handleResetToHome}
          color="#007AFF"
        />        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center", backgroundColor: "#fff" },
  image: { width: 200, height: 200, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  price: { fontSize: 18, color: "#007AFF", marginBottom: 20 },
  desc: { textAlign: "justify", lineHeight: 20, marginBottom: 20 },
  buttonContainer: { gap: 10, width: '100%' },
});