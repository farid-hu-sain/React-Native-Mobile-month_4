import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import AuthGuardTab from "../../components/AuthGuardTab";
import { useUserStats } from "../../context/UserStatsContext";
import NetworkStatus from "../../components/common/NetworkStatus";

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
};

export default function PopularTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { addVisitedScreen } = useUserStats();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 3 : 2;

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Popular Tab");
      return () => {};
    }, [addVisitedScreen])
  );

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

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    Alert.alert("Berhasil", `${product.title} ditambahkan ke keranjang!`);
  };

  // 🔥 PERBAIKAN: Fix navigation ke ProductDetail
  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductDetail", { 
      productId: product.id,
      product: product 
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Memuat produk populer...</Text>
      </View>
    );
  }

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[
      styles.cardContainer,
      { width: isLandscape ? '30%' : '48%' }
    ]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProductPress(item)}
      >
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.price}>
            Rp{item.price.toLocaleString("id-ID")}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>+ Keranjang</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AuthGuardTab>
      <NetworkStatus />
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          numColumns={numColumns}
          columnWrapperStyle={isLandscape ? styles.columnWrapperLandscape : styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          key={numColumns}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AuthGuardTab>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10,
    backgroundColor: '#fff'
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  columnWrapperLandscape: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardContainer: {
    margin: 5,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    marginBottom: 8,
  },
  image: { 
    width: '100%', 
    height: 120,
    marginBottom: 8,
  },
  info: { 
    flex: 1,
  },
  name: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 4,
    flexShrink: 1,
  },
  price: { 
    color: "#007AFF", 
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});