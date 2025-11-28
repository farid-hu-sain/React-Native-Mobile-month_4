import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import AuthGuardTab from '../../components/AuthGuardTab';
import { useUserStats } from '../../context/UserStatsContext';

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
};

export default function ClothingTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { addVisitedScreen } = useUserStats();

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Clothing Tab");
      return () => {};
    }, [addVisitedScreen])
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products/category/men's clothing");
        const json = await response.json();
        setProducts(json);
      } catch (err) {
        console.error(err);
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
    navigation.navigate('ProductDetail', { 
      productId: product.id,
      product: product 
    });
  };

  return (
    <AuthGuardTab>
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleProductPress(item)}
            >
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.price}>Rp{item.price.toLocaleString('id-ID')}</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.addButtonText}>+ Keranjang</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </AuthGuardTab>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  image: { width: 80, height: 80, marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  price: { color: '#007AFF', fontWeight: 'bold', marginBottom: 8 },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});