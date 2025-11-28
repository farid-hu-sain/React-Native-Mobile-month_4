// src/components/navigation/StackNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import Onboarding1 from "../../screens/onboarding/Onboarding1";
import Onboarding2 from "../../screens/onboarding/Onboarding2";
import DrawerNavigator from "./DrawerNavigator";
import { RootStackParamList } from "../../types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

// VALIDASI PARAMETER UNTUK PROFIL
const validateUserId = (userId: string): boolean => {
  const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(userId);
  console.log(`🔍 Validating userId: ${userId} -> ${isValid}`);
  return isValid;
};

// COMPONENT PLACEHOLDER YANG REUSABLE
const PlaceholderScreen = ({ title, subtitle = "" }: { title: string; subtitle?: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
      {title}
    </Text>
    {subtitle ? (
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 }}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);

// COMPONENT UNTUK HANDLE DEEP LINKED PROFILE
const ProfileWithValidation = ({ route, navigation }: any) => {
  const { userId } = route.params || {};
  
  React.useEffect(() => {
    if (userId && !validateUserId(userId)) {
      Alert.alert(
        'ID Tidak Valid',
        `User ID "${userId}" tidak valid. Dialihkan ke halaman home.`,
        [{ text: 'OK', onPress: () => navigation.navigate('MainDrawer') }]
      );
    }
  }, [userId, navigation]);

  return (
    <PlaceholderScreen 
      title="Profile Screen" 
      subtitle={`User ID: ${userId || 'Tidak tersedia'}\n\nImplement profile functionality here`}
    />
  );
};

// COMPONENT UNTUK HANDLE DEEP LINKED PRODUCT
const ProductDetailWithParams = ({ route }: any) => {
  const { id, productId } = route.params || {};
  
  // Handle both string (from deep link) and number (from internal navigation)
  const finalProductId = productId || (id ? parseInt(id, 10) : null);
  
  console.log(`📦 Deep linked to product:`, { id, productId, finalProductId });
  
  return (
    <PlaceholderScreen 
      title="Product Detail Screen" 
      subtitle={`Product ID: ${finalProductId || 'Tidak tersedia'}\nRaw ID from deep link: ${id || 'Tidak ada'}\n\nImplement product detail functionality here`}
    />
  );
};

// PLACEHOLDER COMPONENTS
const AddProductPlaceholder = () => <PlaceholderScreen title="Add Product Screen" />;
const CartPlaceholder = () => <PlaceholderScreen title="Cart Screen" subtitle="Deep linked from: ecommerceapp://keranjang" />;
const CheckoutPlaceholder = () => <PlaceholderScreen title="Checkout Screen" />;
const AddressFormPlaceholder = () => <PlaceholderScreen title="Address Form Screen" />;
const PaymentPlaceholder = () => <PlaceholderScreen title="Payment Screen" />;
const UserStatsPlaceholder = () => <PlaceholderScreen title="User Stats Screen" />;
const ProductListPlaceholder = () => <PlaceholderScreen title="Product List Screen" />;

export default function StackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🧭 StackNavigator:', { isAuthenticated, isLoading });

  // Tampilkan loading screen selama checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? "MainDrawer" : "Onboarding1"}
    >
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
      
      {/* DEEP LINKING UNTUK PRODUK DENGAN PARAMETER */}
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailWithParams}
      />
      
      {/* DEEP LINKING UNTUK PROFIL DENGAN VALIDASI */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileWithValidation}
      />
      
      {/* SCREEN LAINNYA */}
      <Stack.Screen name="AddProduct" component={AddProductPlaceholder} />
      <Stack.Screen name="Cart" component={CartPlaceholder} />
      <Stack.Screen name="Checkout" component={CheckoutPlaceholder} />
      <Stack.Screen name="AddressForm" component={AddressFormPlaceholder} />
      <Stack.Screen name="Payment" component={PaymentPlaceholder} />
      <Stack.Screen name="UserStats" component={UserStatsPlaceholder} />
      <Stack.Screen name="ProductList" component={ProductListPlaceholder} />
    </Stack.Navigator>
  );
}