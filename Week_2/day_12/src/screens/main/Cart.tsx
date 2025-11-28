import React from "react";
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

export default function Cart({ navigation }: any) {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { addVisitedScreen } = useUserStats();

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Cart");
      return () => {};
    }, [addVisitedScreen])
  );

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
      <Text style={styles.title}>🛒 Keranjang Belanja</Text>
      
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
              <Text style={styles.totalText}>Total: Rp{getTotalPrice().toLocaleString("id-ID")}</Text>
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
  },
  buttonContainer: {
    gap: 10,
  },
});