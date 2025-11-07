// src/components/AddProductModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Product } from '../types/Product';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (p: Product) => void;
  theme: any;
};

const AddProductModal = ({ visible, onClose, onAdd, theme }: Props) => {
  const { width, height } = useWindowDimensions(); // ✅ Dinamis terhadap orientasi
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = () => {
    if (!name || !price || !image) {
      Alert.alert('Error', 'Nama, harga, dan URL gambar wajib diisi!');
      return;
    }
    if (isNaN(Number(price))) {
      Alert.alert('Error', 'Harga harus berupa angka!');
      return;
    }

    onAdd({
      id: Date.now(),
      title: name,
      price: parseFloat(price),
      description: desc,
      image,
    });

    setName('');
    setPrice('');
    setImage('');
    setDesc('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
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
              styles.modalContainer,
              {
                backgroundColor: theme.card,
                width: width * 0.9,
                maxHeight: height * 0.8,
              },
            ]}
          >
            <Text style={[styles.title, { color: theme.text }]}>Tambah Produk</Text>

            <TextInput
              placeholder="Nama Produk"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            />
            <TextInput
              placeholder="Harga"
              placeholderTextColor="#999"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            />
            <TextInput
              placeholder="URL Gambar"
              placeholderTextColor="#999"
              value={image}
              onChangeText={setImage}
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            />
            <TextInput
              placeholder="Deskripsi (opsional)"
              placeholderTextColor="#999"
              value={desc}
              onChangeText={setDesc}
              multiline
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.text, height: 80 },
              ]}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.btn, { backgroundColor: '#888' }]}
              >
                <Text style={styles.btnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.btn, { backgroundColor: theme.button }]}
              >
                <Text style={styles.btnText}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddProductModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: { borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 4 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
