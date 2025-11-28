// src/screens/main/AddProduct.tsx (UPDATED)
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import { productStorage } from "../../utils/productStorage";
import { useNavigation } from "@react-navigation/native";
import NetworkStatus from "../../components/common/NetworkStatus";
import { imagePickerUtils } from "../../utils/imagePicker";
import { uploadService } from "../../services/uploadService";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddProduct() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({
    title: "",
    price: "",
    image: "",
    description: "",
    category: "",
  });
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    "Electronics",
    "Clothing", 
    "Food",
    "Automotive",
    "Entertainment",
    "Baby"
  ];

  // Load stored images saat component mount
  useEffect(() => {
    loadStoredImages();
  }, []);

  const loadStoredImages = async () => {
    try {
      const storedAssets = await imagePickerUtils.getStoredProductAssets();
      setSelectedImages(storedAssets);
    } catch (error) {
      console.error('Error loading stored images:', error);
    }
  };

  const handleSelectImages = async () => {
    try {
      const result = await imagePickerUtils.selectProductImages();
      
      if (result.success && result.assets) {
        setSelectedImages(prev => [...prev, ...result.assets!]);
        Alert.alert("Berhasil", ` ${result.assets.length} foto berhasil dipilih`);
      } else if (result.error) {
        Alert.alert("Error", `Gagal memilih foto: ${result.error}`);
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat memilih foto");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    
    // Update AsyncStorage
    imagePickerUtils.clearStoredProductAssets().then(() => {
      if (newImages.length > 0) {
        // Simpan ulang images yang tersisa
        AsyncStorage.setItem('@ecom:newProductAssets', JSON.stringify(newImages));
      }
    });
  };

  const handleAdd = async () => {
    if (!form.title || !form.price || !form.description || !form.category) {
      Alert.alert("Error", "Semua field wajib diisi!");
      return;
    }

    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      Alert.alert("Error", "Harga harus berupa angka yang valid!");
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert("Error", "Pilih minimal 1 foto produk!");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload images terlebih dahulu
      const imageUrls = await uploadService.uploadProductImages(
        selectedImages, 
        (progress) => setUploadProgress(progress)
      );

      // Gunakan URL pertama sebagai gambar utama
      const mainImageUrl = imageUrls[0] || "https://via.placeholder.com/300x300?text=No+Image";

      const newProduct = productStorage.addProduct({
        ...form,
        image: mainImageUrl,
        // Simpan semua image URLs jika needed
        additionalImages: imageUrls.slice(1)
      });
      
      // Clear stored images setelah berhasil
      await imagePickerUtils.clearStoredProductAssets();

      Alert.alert(
        "Berhasil", 
        `Produk "${form.title}" berhasil ditambahkan dengan ${selectedImages.length} foto!`,
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
              setSelectedImages([]);
              setUploadProgress(0);
              navigation.navigate("Home");
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert("Error", "Gagal mengupload foto produk. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <NetworkStatus />
      <Text style={styles.title}>Tambah Produk Baru</Text>
      
      {/* Image Selection Section */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Foto Produk (Maksimal 5)</Text>
        
        <TouchableOpacity 
          style={styles.imagePickerButton}
          onPress={handleSelectImages}
          disabled={selectedImages.length >= 5 || uploading}
        >
          <Icon name="camera" size={20} color="#007AFF" />
          <Text style={styles.imagePickerText}>
            Pilih Foto {selectedImages.length > 0 ? `(${selectedImages.length}/5)` : ''}
          </Text>
        </TouchableOpacity>

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <View style={styles.imagesPreview}>
            <Text style={styles.previewTitle}>
              Foto Terpilih: {selectedImages.length}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesContainer}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image 
                      source={{ uri: image.uri }} 
                      style={styles.previewImage} 
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Icon name="times" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.uploadProgress}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.progressText}>
              Mengupload foto... {uploadProgress}%
            </Text>
          </View>
        )}
      </View>
      
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
        placeholder="Kategori *"
        style={styles.input}
        value={form.category}
        onChangeText={(text) => setForm({...form, category: text})}
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

      <Button 
        title={uploading ? "Mengupload..." : "Tambah Produk"} 
        onPress={handleAdd} 
        disabled={uploading || selectedImages.length === 0}
      />
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
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    gap: 10,
  },
  imagePickerText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagesPreview: {
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#666",
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  imageItem: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#007AFF',
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