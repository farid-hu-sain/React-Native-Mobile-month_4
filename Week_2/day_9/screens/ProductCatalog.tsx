import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Button,
  useColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
};

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products");
        const json = await response.json();
        setProducts(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const themeStyles = {
    backgroundColor: isDark ? "#000" : "#fff",
    color: isDark ? "#fff" : "#000",
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: themeStyles.backgroundColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: themeStyles.color }}>Memuat produk...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <Text style={[styles.title, { color: themeStyles.color }]}>Katalog Produk</Text>

      <Button title="Tambah Produk" onPress={() => navigation.navigate("AddProduct")} />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9" }]}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
          >
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
            <View style={styles.info}>
              <Text style={[styles.name, { color: themeStyles.color }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>
                Rp{item.price.toLocaleString("id-ID")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  image: { width: 60, height: 60, marginRight: 10 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
