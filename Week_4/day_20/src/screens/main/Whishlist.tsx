// src/screens/main/Wishlist.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useWishlist } from '../../context/WishlistContext';
import { productService, Product } from '../../services/productService';
import NetworkStatus from '../../components/common/NetworkStatus';
import { useUserStats } from '../../context/UserStatsContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Wishlist() {
  const navigation = useNavigation<any>();
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistMeta } = useWishlist();
  const { addVisitedScreen } = useUserStats();
  
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Wishlist");
      return () => {};
    }, [addVisitedScreen])
  );

  // Load wishlist products
  const loadWishlistProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (wishlistItems.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      console.log(`🔄 Loading ${wishlistItems.length} wishlist products...`);
      
      // Untuk demo, kita akan menggunakan productService untuk load products
      // Dalam implementasi real, Anda mungkin perlu API endpoint khusus
      const allProducts = await productService.getProducts(100);
      
      // Filter products yang ada di wishlist
      const filteredProducts = allProducts.products.filter((product: Product) =>
        wishlistItems.includes(product.id)
      );

      setWishlistProducts(filteredProducts);
      console.log(`✅ Loaded ${filteredProducts.length} wishlist products`);

    } catch (error: any) {
      console.error('❌ Error loading wishlist products:', error);
      setError('Gagal memuat produk wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Load products when wishlist items change
  useEffect(() => {
    loadWishlistProducts();
  }, [wishlistItems]);

  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductDetail", { 
      productId: product.id,
      product: product 
    });
  };

  const handleRemoveFromWishlist = async (productId: number, productTitle: string) => {
    try {
      await removeFromWishlist(productId);
      Alert.alert("❤️ Dihapus", `${productTitle} dihapus dari wishlist`);
    } catch (error) {
      Alert.alert("Error", "Gagal menghapus dari wishlist");
    }
  };

  const handleClearWishlist = () => {
    Alert.alert(
      "Bersihkan Wishlist",
      "Apakah Anda yakin ingin menghapus semua item dari wishlist?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus Semua", 
          style: "destructive",
          onPress: async () => {
            try {
              await clearWishlist();
              Alert.alert("Berhasil", "Wishlist telah dibersihkan");
            } catch (error) {
              Alert.alert("Error", "Gagal membersihkan wishlist");
            }
          }
        },
      ]
    );
  };

  const renderWishlistItem = ({ item }: { item: Product }) => (
    <View style={styles.wishlistItem}>
      <TouchableOpacity 
        style={styles.productContainer}
        onPress={() => handleProductPress(item)}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage} 
          resizeMode="cover"
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>
            ${item.price.toFixed(2)}
          </Text>
          {item.rating && (
            <Text style={styles.ratingText}>
              ⭐ {item.rating}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFromWishlist(item.id, item.title)}
      >
        <Icon name="trash" size={16} color="#FF6B6B" />
        <Text style={styles.removeText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <NetworkStatus />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat wishlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NetworkStatus />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ Wishlist Saya</Text>
        
        {wishlistMeta && (
          <Text style={styles.metaText}>
            {wishlistItems.length} items • Updated {new Date(wishlistMeta.updatedAt).toLocaleDateString('id-ID')}
          </Text>
        )}
      </View>

      {/* Actions */}
      {wishlistItems.length > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearWishlist}
          >
            <Icon name="trash" size={14} color="#fff" />
            <Text style={styles.clearButtonText}>Bersihkan Semua</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Wishlist Content */}
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="heart-o" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>Wishlist Kosong</Text>
          <Text style={styles.emptyText}>
            Tambahkan produk favorit Anda ke wishlist dengan menekan ikon hati pada produk
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Jelajahi Produk</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistProducts}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            error ? (
              <View style={styles.errorBanner}>
                <Icon name="exclamation-triangle" size={16} color="#856404" />
                <Text style={styles.errorBannerText}>{error}</Text>
                <TouchableOpacity onPress={loadWishlistProducts}>
                  <Text style={styles.retryLink}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 5,
  },
  actionsContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2D3436',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6C757D',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    gap: 4,
  },
  removeText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorBannerText: {
    color: '#856404',
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  retryLink: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 14,
  },
});