// src/components/navigation/StackNavigator.tsx - FIXED VERSION
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Onboarding1 from "../../screens/onboarding/Onboarding1";
import Onboarding2 from "../../screens/onboarding/Onboarding2";
import DrawerNavigator from "./DrawerNavigator";
import { RootStackParamList } from "../../types/navigation";
import ProtectedRoute from "../ProtectedRoute";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Enhanced parameter validation
const validateUserId = (userId: string): boolean => {
  const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(userId);
  console.log(`🔍 Validating userId: ${userId} -> ${isValid}`);
  return isValid;
};

// Enhanced product ID validation
const validateProductId = (productId: any): { isValid: boolean; numericId?: number } => {
  if (!productId) {
    return { isValid: false };
  }
  
  const numericId = parseInt(productId, 10);
  const isValid = !isNaN(numericId) && numericId > 0 && numericId <= 1000;
  
  console.log(`🔍 Validating productId: ${productId} -> ${isValid} (numeric: ${numericId})`);
  return { isValid, numericId };
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

// Enhanced Profile dengan better validation
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

// Enhanced Product Detail dengan better validation
const ProductDetailWithParams = ({ route, navigation }: any) => {
  const { id, productId } = route.params || {};
  
  // Handle both string (from deep link) and number (from internal navigation)
  const validationResult = validateProductId(productId || id);
  
  React.useEffect(() => {
    if ((id || productId) && !validationResult.isValid) {
      Alert.alert(
        'ID Produk Tidak Valid',
        `ID produk "${id || productId}" tidak valid. Dialihkan ke halaman home.`,
        [{ text: 'OK', onPress: () => navigation.navigate('MainDrawer') }]
      );
    }
  }, [id, productId, navigation, validationResult.isValid]);

  console.log(`📦 Deep linked to product:`, { id, productId, finalProductId: validationResult.numericId });
  
  return (
    <PlaceholderScreen 
      title="Product Detail Screen" 
      subtitle={`Product ID: ${validationResult.numericId || 'Tidak tersedia'}\nRaw ID from deep link: ${id || 'Tidak ada'}\nValidation: ${validationResult.isValid ? '✅ VALID' : '❌ INVALID'}\n\nImplement product detail functionality here`}
    />
  );
};

// PLACEHOLDER COMPONENTS
const AddProductPlaceholder = () => <PlaceholderScreen title="Add Product Screen" />;
const AddressFormPlaceholder = () => <PlaceholderScreen title="Address Form Screen" />;
const PaymentPlaceholder = () => <PlaceholderScreen title="Payment Screen" />;
const UserStatsPlaceholder = () => <PlaceholderScreen title="User Stats Screen" />;
const ProductListPlaceholder = () => <PlaceholderScreen title="Product List Screen" />;
const WishlistPlaceholder = () => <PlaceholderScreen title="Wishlist Screen" />;

// CART SCREEN DENGAN PROTECTED ROUTE
const CartWithProtection = ({ navigation }: any) => (
  <ProtectedRoute navigation={navigation}>
    <PlaceholderScreen 
      title="Cart Screen" 
      subtitle="🛒 Protected Cart Screen\nDeep linked from: ecommerceapp://keranjang\n\nToken validation: ✅ PASSED"
    />
  </ProtectedRoute>
);

// CHECKOUT SCREEN DENGAN PROTECTED ROUTE  
const CheckoutWithProtection = ({ navigation }: any) => (
  <ProtectedRoute navigation={navigation}>
    <PlaceholderScreen 
      title="Checkout Screen" 
      subtitle="💳 Protected Checkout Screen\nToken validation: ✅ PASSED"
    />
  </ProtectedRoute>
);

// Enhanced DeepLinkHandler dengan auth awareness
const DeepLinkHandler = () => {
  const { addToCartFromDeepLink, isProcessingDeepLink } = useCart();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    console.log('🔗 Enhanced DeepLinkHandler mounted');
    
    return () => {
      console.log('🔗 Enhanced DeepLinkHandler unmounted');
    };
  }, []);
  
  // Tampilkan indicator jika sedang processing deep link
  if (isProcessingDeepLink) {
    return (
      <View style={{ 
        position: 'absolute', 
        top: 50, 
        alignSelf: 'center', 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        padding: 10, 
        borderRadius: 5,
        zIndex: 1000 
      }}>
        <Text style={{ color: 'white', fontSize: 12 }}>
          🛒 Menambahkan produk dari link...
        </Text>
      </View>
    );
  }
  
  return null;
};

export default function StackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🧭 Enhanced StackNavigator:', { isAuthenticated, isLoading });

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
    <>
      {/* Enhanced Deep Link Handler Component */}
      <DeepLinkHandler />
      
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? "MainDrawer" : "Onboarding1"}
      >
        {/* Onboarding Screens */}
        <Stack.Screen 
          name="Onboarding1" 
          component={Onboarding1}
        />
        <Stack.Screen name="Onboarding2" component={Onboarding2} />
        
        {/* Main Drawer Navigation */}
        <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
        
        {/* Deep Linking untuk Produk dengan Enhanced Validation */}
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailWithParams}
        />
        
        {/* Deep Linking untuk Profil dengan Enhanced Validation */}
        <Stack.Screen 
          name="Profile" 
          component={ProfileWithValidation}
        />
        
        {/* Screen Lainnya */}
        <Stack.Screen name="AddProduct" component={AddProductPlaceholder} />
        
        {/* Protected Routes - Cart & Checkout */}
        <Stack.Screen name="Cart" component={CartWithProtection} />
        <Stack.Screen name="Checkout" component={CheckoutWithProtection} />
        
        <Stack.Screen name="AddressForm" component={AddressFormPlaceholder} />
        <Stack.Screen name="Payment" component={PaymentPlaceholder} />
        <Stack.Screen name="UserStats" component={UserStatsPlaceholder} />
        <Stack.Screen name="ProductList" component={ProductListPlaceholder} />
        <Stack.Screen name="Wishlist" component={WishlistPlaceholder} />
      </Stack.Navigator>
    </>
  );
}