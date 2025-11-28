import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function Checkout({ route, navigation }: any) {
  const { product } = route.params;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Lock drawer when this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({
        swipeEnabled: false,
        drawerLockMode: 'locked-closed'
      });

      return () => {
        navigation.getParent()?.setOptions({
          swipeEnabled: true,
          drawerLockMode: 'unlocked'
        });
      };
    }, [navigation])
  );

  const handleConfirmOrder = () => {
    Alert.alert(
      "Order Confirmed",
      `Terima kasih! Pesanan untuk ${product.title} telah dikonfirmasi.`,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={[
        styles.content,
        isLandscape && styles.contentLandscape
      ]}>
        <View style={[
          styles.productSection,
          isLandscape && styles.productSectionLandscape
        ]}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>
              Rp{product.price.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <Text>Name: John Doe</Text>
          <Text>Address: 123 Main Street, City</Text>
          <Text>Phone: +62 812-3456-7890</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text>Credit Card ending in 4242</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Subtotal:</Text>
            <Text>Rp{product.price.toLocaleString("id-ID")}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Shipping:</Text>
            <Text>Rp15.000</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalText}>
              Rp{(product.price + 15000).toLocaleString("id-ID")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Confirm Order" onPress={handleConfirmOrder} color="#28a745" />
        <Button title="Cancel" onPress={() => navigation.goBack()} color="#dc3545" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  contentLandscape: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productSection: {
    marginBottom: 20,
  },
  productSectionLandscape: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
    marginTop: 10,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 10,
  },
});