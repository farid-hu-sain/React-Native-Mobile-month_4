import React from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Button, 
  Alert,
  useWindowDimensions
} from "react-native";
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { useUserStats } from "../../context/UserStatsContext";

export default function ProductDetail({ route, navigation }: any) {
  const { productId, product } = route.params;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { addToCart } = useCart();
  const { addVisitedScreen } = useUserStats();

  // Track screen visit and lock drawer
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Product Detail");
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
    }, [navigation, addVisitedScreen])
  );

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product tidak ditemukan</Text>
        <Button title="Kembali" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert("Berhasil", "Produk ditambahkan ke keranjang!");
  };

  const handleBuyNow = () => {
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

  return (
    <ScrollView contentContainerStyle={[
      styles.container, 
      isLandscape && styles.containerLandscape
    ]}>
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
        <Text style={styles.price}>Rp{product.price.toLocaleString("id-ID")}</Text>
        <Text style={styles.desc}>{product.description}</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="🛒 Tambah ke Keranjang"
            onPress={handleAddToCart}
            color="#007AFF"
          />
          <Button
            title="🚀 Beli Sekarang"
            onPress={handleBuyNow}
            color="#28a745"
          />
          <Button
            title="🔄 Reset ke Home"
            onPress={handleResetToHome}
            color="#6c757d"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});