// src/screens/main/Home.tsx (UPDATE)
import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  FlatList,
  Image,
  ActivityIndicator,
  Alert 
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { productStorage } from "../../utils/productStorage";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useCart } from "../../context/CartContext";
import { useUserStats } from "../../context/UserStatsContext";
import NetworkStatus from "../../components/common/NetworkStatus";
import { productService, Product } from "../../services/productService";
import { useNetwork } from "../../context/NetworkContext";
import ProductCard from "../../components/common/ProductCard"; // IMPORT BARU

export default function Home() {
  const navigation = useNavigation<any>();
  const { addVisitedScreen } = useUserStats();
  const { getTotalItems } = useCart();
  const { netInfo, hasCheckedConnection } = useNetwork();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Home");
      navigation.getParent()?.setOptions({
        swipeEnabled: true,
      });
      return () => {};
    }, [navigation, addVisitedScreen])
  );

  const loadProducts = useCallback(async () => {
    // Check internet connection first
    if (netInfo.isInternetReachable === false) {
      console.log('No internet connection, using local products only');
      const customProducts = productStorage.getAllProducts();
      setProducts(customProducts);
      setLoading(false);
      if (customProducts.length === 0) {
        setError('No internet connection and no local products available');
      } else {
        setError('Using local products - No internet connection');
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Array untuk menampung semua products dari berbagai sumber
      let allProducts: Product[] = [];

      // 1. Get custom products dari local storage
      const customProducts = productStorage.getAllProducts();
      allProducts = [...customProducts];

      // 2. Get products dari DummyJSON menggunakan Axios Service
      try {
        console.log('🔄 Fetching products from DummyJSON using Axios...');
        const response = await productService.getProducts(20);
        const apiProducts: Product[] = response.products.map((product: any) => ({
          id: product.id + 2000, // ID offset untuk menghindari duplikat
          title: product.title,
          price: product.price,
          image: product.thumbnail,
          description: product.description,
          discountPercentage: product.discountPercentage,
          rating: product.rating,
          stock: product.stock,
          brand: product.brand,
          category: product.category,
          images: product.images
        }));
        allProducts = [...allProducts, ...apiProducts];
        console.log(`✅ Successfully loaded ${apiProducts.length} products from DummyJSON`);
      } catch (apiError: any) {
        console.log('❌ DummyJSON API error:', apiError.message);
        // Continue without DummyJSON products
      }

      // 3. Tetap menggunakan FakeStore API sebagai sumber kedua
      try {
        console.log('🔄 Fetching products from FakeStore API...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const fakeStoreResponse = await fetch("https://fakestoreapi.com/products", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (fakeStoreResponse.ok) {
          const fakeStoreProducts = await fakeStoreResponse.json();
          const formattedFakeStoreProducts: Product[] = fakeStoreProducts.map((product: any) => ({
            id: product.id + 1000, // ID offset untuk menghindari duplikat
            title: product.title,
            price: product.price,
            image: product.image,
            description: product.description,
            category: product.category,
          }));
          allProducts = [...allProducts, ...formattedFakeStoreProducts];
          console.log(`✅ Successfully loaded ${formattedFakeStoreProducts.length} products from FakeStore`);
        }
      } catch (fakeStoreError: any) {
        console.log('❌ FakeStore API error:', fakeStoreError.message);
      }

      // Remove duplicates based on ID and update state
      const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      );
      setProducts(uniqueProducts);
      
      // Show warning if some APIs failed but we still have products
      if (uniqueProducts.length === customProducts.length && customProducts.length > 0) {
        setError('Some products failed to load, showing local products only');
      } else if (uniqueProducts.length === 0) {
        setError('No products available');
      } else {
        console.log(`🎉 Total ${uniqueProducts.length} products loaded from 2 APIs + local storage`);
      }

    } catch (err: any) {
      console.error('❌ Error in loadProducts:', err);
      setError('Failed to load some products');
      // Fallback to custom products only
      const customProducts = productStorage.getAllProducts();
      setProducts(customProducts);
    } finally {
      setLoading(false);
    }
  }, [netInfo.isInternetReachable]);

  useEffect(() => {
    if (hasCheckedConnection) {
      loadProducts();
    }
  }, [hasCheckedConnection, loadProducts]);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleRetry = () => {
    // Reset dan load ulang
    setLoading(true);
    setError(null);
    loadProducts();
  };

  // FITUR BARU: Wishlist toggle handler
  const handleWishlistToggle = (productId: number, isInWishlist: boolean) => {
    console.log(`Product ${productId} ${isInWishlist ? 'added to' : 'removed from'} wishlist`);
  };

  // Show loading while checking initial connection
  if (!hasCheckedConnection) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Checking network connection...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <NetworkStatus />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading products from multiple sources...</Text>
        <Text style={styles.loadingSubtext}>Using Axios for API calls</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <NetworkStatus />
        <Icon name="exclamation-triangle" size={50} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Icon name="refresh" size={16} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>
            Connection: {netInfo.isInternetReachable ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NetworkStatus />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Icon name="bars" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Explore Products</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate("Cart")} 
          style={styles.cartButton}
        >
          <Icon name="shopping-cart" size={20} color="#000" />
          {getTotalItems() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && products.length > 0 && (
        <View style={styles.errorBanner}>
          <Icon name="info-circle" size={16} color="#856404" />
          <Text style={styles.errorBannerText}>
            {error}
          </Text>
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.retryLink}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products Count */}
      <View style={styles.productsCount}>
        <Text style={styles.productsCountText}>
          🎯 Showing {products.length} products from 2 APIs + Local Storage
        </Text>
      </View>

      {/* Products Grid - UPDATED: Gunakan ProductCard */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onWishlistToggle={handleWishlistToggle}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="box-open" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No products available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Reload Products</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddProduct")}
      >
        <Icon name="plus" size={20} color="#fff" />
        <Text style={styles.floatingButtonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  errorText: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  retryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    gap: 15,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  productsCount: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  productsCountText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '500',
  },
  connectionStatus: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  connectionText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  cartButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productsGrid: {
    padding: 10,
    flexGrow: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    gap: 6,
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});