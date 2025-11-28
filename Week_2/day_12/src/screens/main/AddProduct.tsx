import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from "react-native";
import { productStorage } from "../../utils/productStorage";
import { useNavigation } from "@react-navigation/native";

export default function AddProduct() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({
    title: "",
    price: "",
    image: "",
    description: "",
    category: "",
  });

  const categories = [
    "Electronics",
    "Clothing", 
    "Food",
    "Automotive",
    "Entertainment",
    "Baby"
  ];

  const handleAdd = () => {
    if (!form.title || !form.price || !form.image || !form.description || !form.category) {
      Alert.alert("Error", "Semua field wajib diisi!");
      return;
    }

    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      Alert.alert("Error", "Harga harus berupa angka yang valid!");
      return;
    }

    const newProduct = productStorage.addProduct(form);
    
    Alert.alert(
      "Berhasil", 
      `Produk "${form.title}" berhasil ditambahkan!`,
      [
        {
          text: "OK",
          onPress: () => {
            setForm({
              title: "",
              price: "",
              image: "",
              description: "",
              category: "",
            });
            // Navigate back or refresh products
            navigation.navigate("Home");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tambah Produk Baru</Text>
      
      <TextInput 
        placeholder="Nama Produk *" 
        style={styles.input} 
        value={form.title} 
        onChangeText={(text) => setForm({...form, title: text})} 
      />
      
      <TextInput
        placeholder="Harga *"
        style={styles.input}
        keyboardType="numeric"
        value={form.price}
        onChangeText={(text) => setForm({...form, price: text})}
      />
      
      <TextInput 
        placeholder="URL Gambar *" 
        style={styles.input} 
        value={form.image} 
        onChangeText={(text) => setForm({...form, image: text})} 
      />
      
      <TextInput
  placeholder="Kategori *"
  style={styles.input}
  value={form.category}
  onChangeText={(text) => setForm({...form, category: text})}
  {...({ list: 'categories' } as any)}
/>

      
      <TextInput 
        placeholder="Deskripsi Produk *" 
        style={[styles.input, styles.textArea]} 
        value={form.description} 
        onChangeText={(text) => setForm({...form, description: text})} 
        multiline 
        numberOfLines={4}
      />

      <View style={styles.categorySuggestions}>
        <Text style={styles.suggestionTitle}>Kategori yang tersedia:</Text>
        <View style={styles.categoryTags}>
          {categories.map((category) => (
            <Text 
              key={category} 
              style={styles.categoryTag}
              onPress={() => setForm({...form, category})}
            >
              {category}
            </Text>
          ))}
        </View>
      </View>

      <Button title="Tambah Produk" onPress={handleAdd} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categorySuggestions: {
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  categoryTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    color: "#495057",
  },
});