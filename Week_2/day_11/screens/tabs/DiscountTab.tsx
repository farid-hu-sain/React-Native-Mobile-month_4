import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

type Product = {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  discount: number;
};

export default function DiscountTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    React.useCallback(() => {
      console.log('DiscountTab is focused - loading data');
      
      const fetchProducts = async () => {
        try {
          const response = await fetch('https://fakestoreapi.com/products?limit=3');
          const json = await response.json();
          const discountedProducts = json.map((product: any) => ({
            ...product,
            originalPrice: product.price * 1.5,
            discount: 33,
          }));
          setProducts(discountedProducts);
        } catch (err) {
          console.error(err);
        }
      };
      fetchProducts();

      return () => {
        console.log('DiscountTab is unfocused - cleanup');
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.discountPrice}>Rp{item.price.toLocaleString('id-ID')}</Text>
                <Text style={styles.originalPrice}>Rp{item.originalPrice.toLocaleString('id-ID')}</Text>
                <Text style={styles.discountBadge}>{item.discount}% OFF</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
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
  image: { width: 60, height: 60, marginRight: 10 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  discountPrice: { color: '#007AFF', fontWeight: 'bold', marginRight: 8 },
  originalPrice: { textDecorationLine: 'line-through', color: '#8E8E93', marginRight: 8 },
  discountBadge: { color: '#FF3B30', fontWeight: 'bold' },
});