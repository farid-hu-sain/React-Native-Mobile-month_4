import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/StackNavigator";

type ProductDetailRouteProp = RouteProp<RootStackParamList, "ProductDetail">;

type Props = {
  route: ProductDetailRouteProp;
};

export default function ProductDetail({ route }: Props) {
  const { product } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>Rp{product.price.toLocaleString("id-ID")}</Text>
      <Text style={styles.desc}>{product.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center", backgroundColor: "#fff" },
  image: { width: 200, height: 200, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  price: { fontSize: 18, color: "#007AFF", marginBottom: 20 },
  desc: { textAlign: "justify", lineHeight: 20 },
});
