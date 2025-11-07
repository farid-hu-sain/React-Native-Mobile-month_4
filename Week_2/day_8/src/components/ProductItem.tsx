// src/components/ProductItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../types/Product';

type Props = {
  item: Product;
  theme: any;
  onPress: () => void;
};

const ProductItem = ({ item, theme, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.price, { color: theme.text }]}>${item.price}</Text>
    </TouchableOpacity>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  image: { width: '100%', aspectRatio: 1, borderRadius: 8 },
  name: { fontWeight: '600', fontSize: 14, marginVertical: 6 },
  price: { fontWeight: 'bold', fontSize: 16 },
});
