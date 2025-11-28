// src/components/common/WishlistIcon.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useWishlist } from '../../context/WishlistContext';

interface WishlistIconProps {
  productId: number;
  size?: number;
  showCount?: boolean;
  onToggle?: (isInWishlist: boolean) => void;
}

export default function WishlistIcon({ 
  productId, 
  size = 24, 
  showCount = false,
  onToggle 
}: WishlistIconProps) {
  const { isInWishlist, toggleWishlist, getWishlistCount } = useWishlist();
  
  const isProductInWishlist = isInWishlist(productId);
  const wishlistCount = getWishlistCount();

  const handlePress = async () => {
    try {
      await toggleWishlist(productId);
      onToggle?.(!isProductInWishlist);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon 
        name={isProductInWishlist ? "heart" : "heart-o"}
        size={size}
        color={isProductInWishlist ? "#FF6B6B" : "#666"}
        style={styles.icon}
      />
      
      {showCount && wishlistCount > 0 && (
        <Text style={styles.countText}>{wishlistCount}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  icon: {
    // Additional icon styling if needed
  },
  countText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B6B',
    minWidth: 16,
    textAlign: 'center',
  },
});