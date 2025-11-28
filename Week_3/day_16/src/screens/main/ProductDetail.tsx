import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Button, 
  Alert,
  useWindowDimensions,
  ActivityIndicator
} from "react-native";
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { useUserStats } from "../../context/UserStatsContext";
import NetworkStatus from "../../components/common/NetworkStatus";
import { productService } from "../../services/productService";

// Toast Notification Component
const Toast = ({ message, visible, onHide }: { message: string, visible: boolean, onHide: () => void }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000); // Auto hide setelah 3 detik

      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

// Fallback product data
const FALLBACK_PRODUCT = {
  id: 999,
  title: "Produk Tidak Tersedia",
  price: 0,
  image: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Produk+Tidak+Tersedia",
  description: "Maaf, produk ini sedang tidak tersedia. Silakan coba lagi nanti atau hubungi customer service.",
  category: "Unknown",
  rating: 0,
  stock: 0
};

export default function ProductDetail({ route, navigation }: any) {
  const { productId, product: initialProduct } = route.params;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { addToCart } = useCart();
  const { addVisitedScreen } = useUserStats();

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Show toast notification
  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  // Hide toast notification
  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // Fetch product details
  const fetchProductDetails = useCallback(async () => {
    if (initialProduct) {
      return; // Skip fetch jika sudah ada product dari params
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching product details for ID: ${productId}`);

      const productData = await productService.getProductById(productId);
      setProduct(productData);
      console.log(`✅ Successfully loaded product: ${productData.title}`);

    } catch (error: any) {
      console.error('❌ Error fetching product details:', error);
      
      // Handle specific HTTP status codes
      if (error.response?.status === 404) {
        console.log('📋 HTTP 404 - Product not found');
        setError('Produk tidak ditemukan');
        showToastMessage("Gagal memuat data terbaru. Menampilkan versi arsip.");
      } else if (error.response?.status === 500) {
        console.log('📋 HTTP 500 - Internal server error');
        setError('Server mengalami masalah');
        showToastMessage("Gagal memuat data terbaru. Menampilkan versi arsip.");
      } else if (error.code === 'NETWORK_ERROR') {
        console.log('📋 Network error - No internet connection');
        setError('Tidak ada koneksi internet');
        showToastMessage("Gagal memuat data terbaru. Menampilkan versi arsip.");
      } else {
        console.log('📋 Unknown error:', error.message);
        setError('Terjadi kesalahan tidak terduga');
        showToastMessage("Gagal memuat data terbaru. Menampilkan versi arsip.");
      }

      // Use fallback data
      setProduct({
        ...FALLBACK_PRODUCT,
        id: productId,
        title: `Produk #${productId} - Tidak Tersedia`
      });

    } finally {
      setLoading(false);
    }
  }, [productId, initialProduct, showToastMessage]);

  // Track screen visit and lock drawer
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Product Detail");
      navigation.getParent()?.setOptions({
        swipeEnabled: false,
        drawerLockMode: 'locked-closed'
      });

      // Fetch product details jika tidak ada initial product
      if (!initialProduct) {
        fetchProductDetails();
      }

      return () => {
        navigation.getParent()?.setOptions({
          swipeEnabled: true,
          drawerLockMode: 'unlocked'
        });
      };
    }, [navigation, addVisitedScreen, initialProduct, fetchProductDetails])
  );

  const handleAddToCart = () => {
    if (!product || product.id === FALLBACK_PRODUCT.id) {
      Alert.alert("Error", "Tidak dapat menambahkan produk yang tidak tersedia ke keranjang.");
      return;
    }
    
    addToCart(product);
    Alert.alert("Berhasil", "Produk ditambahkan ke keranjang!");
  };

  const handleBuyNow = () => {
    if (!product || product.id === FALLBACK_PRODUCT.id) {
      Alert.alert("Error", "Tidak dapat membeli produk yang tidak tersedia.");
      return;
    }
    
    addToCart(product);
    navigation.navigate("Cart");
  };

  const handleResetToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
    
    navigation.dispatch(DrawerActions.closeDrawer());
    Alert.alert("Success", "Navigasi direset ke Home dan Drawer ditutup");
  };

  const handleRetry = () => {
    if (!initialProduct) {
      fetchProductDetails();
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <NetworkStatus />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat detail produk...</Text>
      </View>
    );
  }

  // Error state dengan fallback data
  if (!product) {
    return (
      <View style={styles.container}>
        <NetworkStatus />
        <Text style={styles.errorTitle}>Produk tidak ditemukan</Text>
        <Text style={styles.errorMessage}>Product ID: {productId}</Text>
        <Button title="Coba Lagi" onPress={handleRetry} color="#007AFF" />
        <Button title="Kembali" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isFallbackProduct = product.id === FALLBACK_PRODUCT.id;

  return (
    <View style={styles.flexContainer}>
      <Toast 
        message={toastMessage} 
        visible={showToast} 
        onHide={hideToast} 
      />
      
      <ScrollView contentContainerStyle={[
        styles.container, 
        isLandscape && styles.containerLandscape
      ]}>
        <NetworkStatus />
        
        {isFallbackProduct && (
          <View style={styles.fallbackBanner}>
            <Text style={styles.fallbackText}>⚠️ Menampilkan Versi Arsip</Text>
          </View>
        )}
        
        <View style={[
          styles.imageContainer,
          isLandscape && styles.imageContainerLandscape
        ]}>
          <Image 
            source={{ uri: product.image }} 
            style={[
              styles.image,
              isLandscape && styles.imageLandscape
            ]} 
            resizeMode="contain" 
          />
        </View>
        
        <View style={[
          styles.infoContainer,
          isLandscape && styles.infoContainerLandscape
        ]}>
          <Text style={styles.title}>{product.title}</Text>
          {!isFallbackProduct && (
            <Text style={styles.price}>Rp{product.price.toLocaleString("id-ID")}</Text>
          )}
          <Text style={styles.desc}>{product.description}</Text>
          
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
              <Button title="Coba Muat Ulang" onPress={handleRetry} />
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <Button
              title="🛒 Tambah ke Keranjang"
              onPress={handleAddToCart}
              color="#007AFF"
              disabled={isFallbackProduct}
            />
            <Button
              title="🚀 Beli Sekarang"
              onPress={handleBuyNow}
              color="#28a745"
              disabled={isFallbackProduct}
            />
            <Button
              title="🔄 Reset ke Home"
              onPress={handleResetToHome}
              color="#6c757d"
            />
            {!initialProduct && (
              <Button
                title="🔄 Muat Ulang Data"
                onPress={handleRetry}
                color="#FFA500"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  containerLandscape: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
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
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainerLandscape: {
    flex: 1,
    marginRight: 20,
    marginBottom: 0,
    justifyContent: 'center',
  },
  image: { 
    width: 300, 
    height: 300,
  },
  imageLandscape: {
    width: 250,
    height: 250,
    maxWidth: '100%',
  },
  infoContainer: {
    flex: 1,
  },
  infoContainerLandscape: {
    flex: 1,
    justifyContent: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10,
    textAlign: "left",
  },
  price: { 
    fontSize: 20, 
    color: "#007AFF", 
    marginBottom: 20,
    fontWeight: 'bold',
  },
  desc: { 
    textAlign: "justify", 
    lineHeight: 20, 
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: { 
    gap: 10, 
    width: '100%' 
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#FFEAA7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FDCB6E',
  },
  errorBannerText: {
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  fallbackBanner: {
    backgroundColor: '#D4EDDA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  fallbackText: {
    color: '#155724',
    fontWeight: '600',
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});