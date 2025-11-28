import React, { useEffect, useState } from "react";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  FlatList,
  Image,
  ActivityIndicator 
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { productStorage } from "../../utils/productStorage";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useCart } from "../../context/CartContext";
import { useUserStats } from "../../context/UserStatsContext";

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
};

export default function Home() {
  const navigation = useNavigation<any>();
  const { addVisitedScreen } = useUserStats();
  const { getTotalItems } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Fetch from API
      const response = await fetch("https://fakestoreapi.com/products");
      const apiProducts = await response.json();
      
      // Get custom products
      const customProducts = productStorage.getAllProducts();
      
      // Combine both
      setProducts([...customProducts, ...apiProducts]);
    } catch (err) {
      console.error(err);
      // If API fails, use custom products only
      setProducts(productStorage.getAllProducts());
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductDetail", { 
      productId: product.id,
      product: product 
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>
          Rp{item.price.toLocaleString("id-ID")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Memuat produk...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Icon name="bars" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Jelajahi Produk</Text>
        
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

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartButton: {
    padding: 5,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productsGrid: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    maxWidth: '48%',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 4,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
    zIndex: 1000,
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
});