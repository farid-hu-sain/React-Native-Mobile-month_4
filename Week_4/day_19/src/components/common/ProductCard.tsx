// src/components/common/ProductCard.tsx (ENHANCED WISHLIST)
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import WishlistIcon from './WishlistIcon';
import { Product } from '../../services/productService';

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: number, isInWishlist: boolean) => void;
}

export default function ProductCard({ product, onWishlistToggle }: ProductCardProps) {
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleProductPress = () => {
    navigation.navigate("ProductDetail", { 
      productId: product.id,
      product: product 
    });
  };

  const handleAddToCart = () => {
    // Animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    addToCart(product);
    Alert.alert("Berhasil", "Produk ditambahkan ke keranjang!");
  };

  const handleWishlistPress = async () => {
    try {
      const wasInWishlist = isInWishlist(product.id);
      await toggleWishlist(product.id);
      
      onWishlistToggle?.(product.id, !wasInWishlist);
      
      // Show subtle feedback instead of alert
      console.log(`❤️ Product ${product.id} ${!wasInWishlist ? 'added to' : 'removed from'} wishlist`);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert("Error", "Gagal mengupdate wishlist");
    }
  };

  const isProductInWishlist = isInWishlist(product.id);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.productCard}
        onPress={handleProductPress}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage} 
            resizeMode="cover"
            onError={() => console.log('Image load error for:', product.title)}
          />
          
          {/* Wishlist Button */}
          <View style={styles.wishlistButton}>
            <WishlistIcon 
              productId={product.id}
              size={20}
              onToggle={handleWishlistPress}
            />
          </View>

          {/* Discount Badge */}
          {product.discountPercentage && product.discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {product.discountPercentage}% OFF
              </Text>
            </View>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>HABIS</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              ${product.price.toFixed(2)}
            </Text>
            
            {product.discountPercentage && product.discountPercentage > 0 && (
              <Text style={styles.originalPrice}>
                ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
              </Text>
            )}
          </View>

          {/* Product Details */}
          <View style={styles.productDetails}>
            {product.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {product.rating}</Text>
              </View>
            )}
            
            {product.stock !== undefined && (
              <Text style={[
                styles.stockText,
                product.stock === 0 && styles.outOfStockText
              ]}>
                {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
              </Text>
            )}
          </View>

          {product.category && (
            <Text style={styles.categoryText}>
              {product.category}
            </Text>
          )}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            product.stock === 0 && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={styles.addToCartText}>
            {product.stock === 0 ? 'HABIS' : '+ Keranjang'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
    maxWidth: '48%',
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  wishlistButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#2D3436',
    lineHeight: 18,
    minHeight: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 12,
    color: '#6C757D',
    textDecorationLine: 'line-through',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: '#6C757D',
  },
  stockText: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 10,
    color: '#ADB5BD',
    fontStyle: 'italic',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#6C757D',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});