import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const handleAdd = () => {
    if (!title || !price || !image) {
      Alert.alert("Error", "Semua field wajib diisi!");
      return;
    }
    Alert.alert("Berhasil", `Produk "${title}" berhasil ditambahkan!`);
    setTitle("");
    setPrice("");
    setImage("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tambah Produk Baru</Text>
      <TextInput placeholder="Nama Produk" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Harga" style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TextInput placeholder="URL Gambar" style={styles.input} value={image} onChangeText={setImage} />
      <Button title="Tambah Produk" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});
