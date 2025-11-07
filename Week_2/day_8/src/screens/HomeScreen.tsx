// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product } from '../types/Product';
import ProductItem from '../components/ProductItem';
import AddProductModal from '../components/AddProductModal';

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { width, height } = useWindowDimensions(); // 🔹 Responsif terhadap rotasi layar
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => alert('Gagal memuat data produk'));
  }, []);

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🛍️ Tokogacor</Text>
        <Switch value={isDark} onValueChange={setIsDark} />
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        numColumns={width > height ? 3 : 2} // 🔹 ubah jumlah kolom berdasarkan orientasi
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductItem
            item={item}
            theme={theme}
            onPress={() => setSelectedProduct(item)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      {/* Floating Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.button }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>+ Tambah Produk</Text>
      </TouchableOpacity>

      {/* Modal Tambah Produk */}
      <AddProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addProduct}
        theme={theme}
      />

      {/* Modal Detail Produk */}
      <Modal visible={!!selectedProduct} transparent animationType="fade">
        <View style={styles.overlay}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={[
                styles.detailContainer,
                { backgroundColor: theme.card, width: width * 0.9, maxHeight: height * 0.8 },
              ]}
            >
              <Image
                source={{ uri: selectedProduct?.image }}
                style={[styles.detailImage, { height: height * 0.3 }]}
                resizeMode="contain"
              />
              <Text style={[styles.detailTitle, { color: theme.text }]}>
                {selectedProduct?.title}
              </Text>
              <Text style={[styles.detailPrice, { color: theme.text }]}>
                ${selectedProduct?.price}
              </Text>
              <Text style={[styles.detailDesc, { color: theme.text }]}>
                {selectedProduct?.description}
              </Text>

              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.button }]}
                onPress={() => setSelectedProduct(null)}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

const lightTheme = {
  background: '#F9F9F9',
  text: '#222',
  card: '#FFF',
  button: '#007AFF',
};

const darkTheme = {
  background: '#121212',
  text: '#FFF',
  card: '#292929',
  button: '#BB86FC',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  list: { padding: 8 },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContainer: {
    borderRadius: 12,
    padding: 16,
  },
  detailImage: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 10,
  },
  detailTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  detailPrice: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  detailDesc: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  closeBtn: { padding: 10, borderRadius: 8, marginTop: 8 },
});
