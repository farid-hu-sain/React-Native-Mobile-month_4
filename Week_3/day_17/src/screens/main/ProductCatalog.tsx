import React, { useEffect, useState, useCallback } from "react";
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
import { DrawerActions } from "@react-navigation/native";
import { useNetwork } from "../../context/NetworkContext";
import NetworkStatus from "../../components/common/NetworkStatus";
import { Product, productService } from "../../services/productService";

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [maxRetriesReached, setMaxRetriesReached] = useState(false);
  
  const { netInfo, hasCheckedConnection } = useNetwork();
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Exponential backoff delays: 1s, 2s, 4s
  const getRetryDelay = (attempt: number): number => {
    return Math.pow(2, attempt) * 1000; // 2^attempt * 1000ms
  };

  const fetchProductsWithRetry = useCallback(async (attempt: number = 0): Promise<void> => {
    if (attempt >= 3) {
      // Max retries reached
      setMaxRetriesReached(true);
      setLoading(false);
      setIsRetrying(false);
      setError('Gagal memuat produk setelah 3x percobaan. Silakan coba lagi manual.');
      console.log('❌ Max retries (3) reached. Showing permanent error UI.');
      return;
    }

    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt} in ${getRetryDelay(attempt) / 1000}s...`);
        setIsRetrying(true);
        setRetryCount(attempt);
        
        // Apply exponential backoff delay - FIXED: properly typed Promise
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, getRetryDelay(attempt));
        });
      }

      console.log(`🚀 Fetching products (attempt ${attempt + 1}/3)...`);
      setError(null);
      
      // Try Axios service first
      const response = await productService.getProducts(30);
      setProducts(response.products);
      setMaxRetriesReached(false);
      setRetryCount(0);
      setIsRetrying(false);
      console.log(`✅ Successfully loaded ${response.products.length} products on attempt ${attempt + 1}`);
      
    } catch (err: any) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, err.message);
      
      // Fallback ke fetch biasa jika Axios gagal
      try {
        console.log('🔄 Trying fallback with fetch API...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch("https://fakestoreapi.com/products", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          setProducts(json);
          setError(null);
          setMaxRetriesReached(false);
          setRetryCount(0);
          setIsRetrying(false);
          console.log(`✅ Fallback successful on attempt ${attempt + 1}`);
          return;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (fallbackError: any) {
        console.error(`❌ Fallback also failed on attempt ${attempt + 1}:`, fallbackError.message);
        
        // Only show error if it's not an abort error and not retrying
        if (fallbackError.name !== 'AbortError' && attempt === 2) {
          setError(`Gagal memuat produk: ${fallbackError.message}`);
        }
        
        // Schedule next retry
        if (attempt < 2) {
          console.log(`⏰ Scheduling retry ${attempt + 2}...`);
          fetchProductsWithRetry(attempt + 1);
        } else {
          // Last attempt failed
          setMaxRetriesReached(true);
          setLoading(false);
          setIsRetrying(false);
          setError('Gagal memuat produk setelah 3x percobaan. Silakan coba lagi manual.');
        }
      }
    }
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setMaxRetriesReached(false);
    setIsRetrying(false);
    fetchProductsWithRetry(0);
  }, [fetchProductsWithRetry]);

  useEffect(() => {
    if (hasCheckedConnection && netInfo.isInternetReachable) {
      fetchProducts();
    } else if (hasCheckedConnection && netInfo.isInternetReachable === false) {
      setLoading(false);
      setError("Tidak ada koneksi internet");
    }
  }, [hasCheckedConnection, netInfo.isInternetReachable, fetchProducts]);

  const themeStyles = {
    backgroundColor: isDark ? "#000" : "#fff",
    color: isDark ? "#fff" : "#000",
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductDetail", { 
      productId: product.id,
      product: product 
    });
  };

  const handleManualRetry = () => {
    if (netInfo.isInternetReachable) {
      console.log('🔄 Manual retry initiated by user');
      fetchProducts();
    }
  };

  // Show loading while checking initial connection
  if (!hasCheckedConnection) {
    return (
      <View style={[styles.center, { backgroundColor: themeStyles.backgroundColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: themeStyles.color }}>Memeriksa koneksi...</Text>
      </View>
    );
  }

  if (loading && !isRetrying) {
    return (
      <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
        <NetworkStatus />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ color: themeStyles.color, marginTop: 10 }}>Memuat produk...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <NetworkStatus />
      
      <Button 
        title="☰ Buka Drawer" 
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
      />

      <Text style={[styles.title, { color: themeStyles.color }]}>Katalog Produk</Text>

      <Button 
        title="Tambah Produk" 
        onPress={() => navigation.navigate("AddProduct")} 
      />

      {/* Retry Status Indicator */}
      {isRetrying && (
        <View style={styles.retryStatus}>
          <ActivityIndicator size="small" color="#FFA500" />
          <Text style={styles.retryStatusText}>
            Mencoba ulang... ({retryCount + 1}/3)
          </Text>
          <Text style={styles.retryDelayText}>
            Delay: {getRetryDelay(retryCount) / 1000} detik
          </Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={[
          styles.errorContainer,
          maxRetriesReached && styles.permanentErrorContainer
        ]}>
          <Text style={styles.errorText}>{error}</Text>
          
          {maxRetriesReached ? (
            <View style={styles.permanentErrorActions}>
              <Text style={styles.permanentErrorText}>
                ⚠️ Semua percobaan otomatis gagal
              </Text>
              <TouchableOpacity 
                style={styles.manualRetryButton} 
                onPress={handleManualRetry}
              >
                <Text style={styles.manualRetryButtonText}>Coba Lagi Manual</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.retryButton} onPress={handleManualRetry}>
              <Text style={styles.retryButtonText}>
                {isRetrying ? 'Batalkan' : 'Coba Sekarang'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9" }]}
            onPress={() => handleProductPress(item)}
          >
            <Image 
              source={{ uri: item.image }} 
              style={styles.image} 
              resizeMode="contain" 
            />
            <View style={styles.info}>
              <Text style={[styles.name, { color: themeStyles.color }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>
                Rp{item.price.toLocaleString("id-ID")}
              </Text>
              {item.rating && (
                <Text style={[styles.rating, { color: themeStyles.color }]}>
                  ⭐ {item.rating}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themeStyles.color }]}>
              {netInfo.isInternetReachable === false 
                ? "Tidak dapat memuat produk - Periksa koneksi internet Anda"
                : "Tidak ada produk yang ditemukan"
              }
            </Text>
            {netInfo.isInternetReachable && !maxRetriesReached && (
              <TouchableOpacity style={styles.retryButton} onPress={handleManualRetry}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={products.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 15,
    elevation: 2,
  },
  image: { 
    width: 60, 
    height: 60, 
    marginRight: 10,
    borderRadius: 5,
  },
  info: { 
    flex: 1,
  },
  name: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEAA7',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FDCB6E',
  },
  permanentErrorContainer: {
    backgroundColor: '#FFD1D1',
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  manualRetryButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  manualRetryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  permanentErrorActions: {
    alignItems: 'center',
    width: '100%',
  },
  permanentErrorText: {
    color: '#D63031',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryStatus: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  retryStatusText: {
    color: '#856404',
    fontWeight: '500',
  },
  retryDelayText: {
    color: '#856404',
    fontSize: 12,
    opacity: 0.8,
  },
});