import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { useUserStats } from "../../context/UserStatsContext";
import NetworkStatus from "../../components/common/NetworkStatus";
import { useNetwork } from "../../context/NetworkContext";
import NetInfo from '@react-native-community/netinfo';

export default function Cart({ navigation }: any) {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, getTotalItems } = useCart();
  const { addVisitedScreen } = useUserStats();
  const { netInfo } = useNetwork();
  
  const [pollingActive, setPollingActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isCellular, setIsCellular] = useState(false);

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Cart");
      return () => {};
    }, [addVisitedScreen])
  );

  // Polling function untuk update total belanja
  const updateCartTotal = useCallback(async () => {
    if (cartItems.length === 0) return;
    
    try {
      console.log('🔄 Polling: Updating cart total...');
      
      // Simulasi API call untuk mendapatkan update harga
      const response = await fetch('https://dummyjson.com/http/200', {
        method: 'GET',
        headers: {
          'X-Client-Platform': 'React-Native',
        },
      });
      
      if (response.ok) {
        const timestamp = new Date().toLocaleTimeString();
        setLastUpdate(`Terakhir update: ${timestamp}`);
        console.log('✅ Polling: Cart total updated at', timestamp);
      }
    } catch (error) {
      console.log('❌ Polling: Failed to update cart total', error);
    }
  }, [cartItems.length]);

  // Effect untuk polling dengan optimasi bandwidth
  useEffect(() => {
    let intervalId: number | null = null;
    
    // Check connection type
    const checkConnectionType = async () => {
      const state = await NetInfo.fetch();
      const cellularConnection = state.type === 'cellular';
      setIsCellular(cellularConnection);
      
      console.log(`📱 Connection type: ${state.type}, Cellular: ${cellularConnection}`);
      
      // Hentikan polling jika connection type adalah cellular
      if (cellularConnection) {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
        setPollingActive(false);
        console.log('⏹️ Polling stopped: Cellular connection detected');
        return;
      }
      
      // Start polling hanya jika ada items di cart DAN bukan cellular
      if (cartItems.length > 0 && !cellularConnection) {
        setPollingActive(true);
        console.log('🔄 Starting polling every 15 seconds...');
        
        // Update segera sekali
        updateCartTotal();
        
        // Set interval untuk polling setiap 15 detik
        intervalId = setInterval(updateCartTotal, 15000) as unknown as number;
      } else {
        setPollingActive(false);
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    checkConnectionType();

    // Cleanup function
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        console.log('🧹 Polling interval cleared on unmount');
      }
      setPollingActive(false);
    };
  }, [cartItems.length, netInfo.type, updateCartTotal]);

  // Effect untuk monitor perubahan network type
  useEffect(() => {
    const checkCellular = async () => {
      const state = await NetInfo.fetch();
      const cellularConnection = state.type === 'cellular';
      setIsCellular(cellularConnection);
      
      if (cellularConnection && pollingActive) {
        console.log('📱 Cellular detected - stopping polling to save data');
        setPollingActive(false);
      }
    };

    checkCellular();
  }, [netInfo.type, pollingActive]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Keranjang Kosong", "Tambahkan produk terlebih dahulu!");
      return;
    }
    navigation.navigate("AddressForm");
  };

  const handleRemoveItem = (item: any) => {
    Alert.alert(
      "Hapus Produk",
      `Hapus ${item.title} dari keranjang?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => removeFromCart(item.id)
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>Rp{item.price.toLocaleString("id-ID")}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item)}
      >
        <Text style={styles.removeText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <NetworkStatus />
      
      <Text style={styles.title}>🛒 Keranjang Belanja</Text>
      
      {/* Polling Status Indicator */}
      {cartItems.length > 0 && (
        <View style={styles.pollingStatus}>
          <View style={styles.pollingInfo}>
            <Text style={[
              styles.pollingText,
              pollingActive ? styles.pollingActive : styles.pollingInactive
            ]}>
              {pollingActive ? '🔄 Live Update' : '⏸️ Update Paused'}
            </Text>
            {isCellular && (
              <Text style={styles.cellularWarning}>
                📱 Mode hemat kuota (WiFi diperlukan untuk live update)
              </Text>
            )}
            {lastUpdate ? (
              <Text style={styles.lastUpdateText}>{lastUpdate}</Text>
            ) : null}
          </View>
        </View>
      )}
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyText}>Keranjang Anda kosong</Text>
          <Button 
            title="Belanja Sekarang" 
            onPress={() => navigation.navigate("Home")}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.cartList}
          />
          
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>
                Total: Rp{getTotalPrice().toLocaleString("id-ID")}
              </Text>
              <Text style={styles.itemsCount}>
                {getTotalItems()} item di keranjang
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Bersihkan Keranjang" 
                onPress={() => clearCart()}
                color="#FF3B30"
              />
              <Button 
                title="Checkout" 
                onPress={handleCheckout}
                color="#28a745"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pollingStatus: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  pollingInfo: {
    alignItems: "center",
  },
  pollingText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  pollingActive: {
    color: "#28a745",
  },
  pollingInactive: {
    color: "#6c757d",
  },
  cellularWarning: {
    fontSize: 12,
    color: "#dc3545",
    textAlign: "center",
    fontStyle: "italic",
  },
  lastUpdateText: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 4,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#666",
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: {
    padding: 10,
  },
  removeText: {
    fontSize: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 20,
  },
  totalContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemsCount: {
    fontSize: 14,
    color: "#6c757d",
  },
  buttonContainer: {
    gap: 10,
  },
});