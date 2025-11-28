import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  Alert,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import NetworkStatus from "../../components/common/NetworkStatus";
import apiClient, { getValidationErrors, clearValidationErrors } from "../../services/apiClient";

export default function Checkout({ route, navigation }: any) {
  const { product } = route.params;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Form state
  const [formData, setFormData] = useState({
    name: "John Doe",
    address: "",
    phone: "+62 ",
    paymentMethod: "credit_card",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Clear validation errors ketika keluar dari screen
        clearValidationErrors();
      };
    }, [navigation])
  );

  // Update form data
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error untuk field ini ketika user mulai mengetik
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Simulate form submission dengan validation
  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setValidationErrors({});
    clearValidationErrors();

    try {
      console.log('🚀 Submitting order...');
      
      // Simulasi POST request ke endpoint checkout
      const response = await apiClient.post('/carts/add', {
        productId: product.id,
        quantity: 1,
        shippingInfo: {
          name: formData.name,
          address: formData.address,
          phone: formData.phone
        },
        paymentInfo: {
          method: formData.paymentMethod,
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv
        }
      });

      // Success case
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

    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      
      // Handle validation errors dari interceptor
      if (error.type === 'VALIDATION_ERROR') {
        const errors = getValidationErrors();
        setValidationErrors(errors);
        console.log('📋 Displaying validation errors:', errors);
      } else {
        // Handle other errors
        Alert.alert(
          "Error",
          "Terjadi kesalahan saat memproses pesanan. Silakan coba lagi."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.address.trim() &&
      formData.phone.trim() &&
      formData.cardNumber.trim() &&
      formData.expiryDate.trim() &&
      formData.cvv.trim() &&
      !isSubmitting
    );
  };

  return (
    <View style={styles.container}>
      <NetworkStatus />
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

        {/* Shipping Information Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.name && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Masukkan nama lengkap"
            />
            {validationErrors.name && (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Alamat Lengkap *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                validationErrors.address && styles.inputError
              ]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Masukkan alamat lengkap pengiriman"
              multiline
              numberOfLines={3}
            />
            {validationErrors.address && (
              <Text style={styles.errorText}>{validationErrors.address}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nomor Telepon *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.phone && styles.inputError
              ]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+62 812-3456-7890"
              keyboardType="phone-pad"
            />
            {validationErrors.phone && (
              <Text style={styles.errorText}>{validationErrors.phone}</Text>
            )}
          </View>
        </View>

        {/* Payment Information Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Metode Pembayaran</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleInputChange('paymentMethod', 'credit_card')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.paymentMethod === 'credit_card' && styles.radioCircleSelected
                ]} />
                <Text>Kartu Kredit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleInputChange('paymentMethod', 'bank_transfer')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.paymentMethod === 'bank_transfer' && styles.radioCircleSelected
                ]} />
                <Text>Transfer Bank</Text>
              </TouchableOpacity>
            </View>
          </View>

          {formData.paymentMethod === 'credit_card' && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nomor Kartu *</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.cardNumber && styles.inputError
                  ]}
                  value={formData.cardNumber}
                  onChangeText={(value) => handleInputChange('cardNumber', value)}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                />
                {validationErrors.cardNumber && (
                  <Text style={styles.errorText}>{validationErrors.cardNumber}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Masa Berlaku *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.expiryDate && styles.inputError
                    ]}
                    value={formData.expiryDate}
                    onChangeText={(value) => handleInputChange('expiryDate', value)}
                    placeholder="MM/YY"
                  />
                  {validationErrors.expiryDate && (
                    <Text style={styles.errorText}>{validationErrors.expiryDate}</Text>
                  )}
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>CVV *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.cvv && styles.inputError
                    ]}
                    value={formData.cvv}
                    onChangeText={(value) => handleInputChange('cvv', value)}
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                  />
                  {validationErrors.cvv && (
                    <Text style={styles.errorText}>{validationErrors.cvv}</Text>
                  )}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
          <View style={styles.summaryRow}>
            <Text>Subtotal:</Text>
            <Text>Rp{product.price.toLocaleString("id-ID")}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Pengiriman:</Text>
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
        <Button 
          title={isSubmitting ? "Memproses..." : "Konfirmasi Pesanan"} 
          onPress={handleConfirmOrder} 
          color="#28a745"
          disabled={!isFormValid()}
        />
        <Button 
          title="Batal" 
          onPress={() => navigation.goBack()} 
          color="#dc3545" 
          disabled={isSubmitting}
        />
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
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  radioCircleSelected: {
    backgroundColor: "#007AFF",
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
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