// src/components/navigation/MainStackNavigator.tsx (UPDATED WITH LOCATION FEATURES)
import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Home from "../../screens/main/Home";
import ProductDetail from "../../screens/main/ProductDetail";
import AddProduct from "../../screens/main/AddProduct";
import Checkout from "../../screens/main/Checkout";
import Cart from "../../screens/main/Cart";
import AddressForm from "../../screens/main/AddressForm";
import Payment from "../../screens/main/Payment";
import NearbyStores from "../../screens/main/NearbyStores"; // ✅ NEW
 // ✅ NEW
import { MainStackParamList } from "../../types/navigation";
import ProtectedRoute from "../ProtectedRoute";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CourierTracking from "../../screens/main/CourerTracking";

const Stack = createNativeStackNavigator<MainStackParamList>();

// Enhanced typing untuk protected components
interface ProtectedComponentProps {
  navigation: NativeStackNavigationProp<MainStackParamList>;
  route?: any;
}

const ProtectedCart = ({ navigation }: ProtectedComponentProps) => (
  <ProtectedRoute navigation={navigation}>
    <Cart />
  </ProtectedRoute>
);

const ProtectedCheckout = ({ navigation, route }: ProtectedComponentProps) => (
  <ProtectedRoute navigation={navigation}>
    <Checkout route={route} navigation={navigation} />
  </ProtectedRoute>
);

// ✅ NEW: Protected location features
const ProtectedNearbyStores = ({ navigation }: ProtectedComponentProps) => (
  <ProtectedRoute navigation={navigation}>
    <NearbyStores />
  </ProtectedRoute>
);

const ProtectedCourierTracking = ({ navigation }: ProtectedComponentProps) => (
  <ProtectedRoute navigation={navigation}>
    <CourierTracking />
  </ProtectedRoute>
);

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8f8f8',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={Home}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetail}
        options={{ 
          title: "📦 Product Detail",
        }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProduct}
        options={{ 
          title: "➕ Add Product",
        }}
      />
      
      {/* PROTECTED ROUTES */}
      <Stack.Screen 
        name="Cart" 
        component={ProtectedCart}
        options={{ 
          title: "🛒 Keranjang",
        }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={ProtectedCheckout}
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="AddressForm" 
        component={AddressForm}
        options={{ 
          title: "📦 Alamat Pengiriman",
        }}
      />
      <Stack.Screen 
        name="Payment" 
        component={Payment}
        options={{ 
          title: "💳 Pembayaran",
        }}
      />

      {/* ✅ NEW LOCATION-BASED FEATURES */}
      <Stack.Screen 
        name="NearbyStores" 
        component={ProtectedNearbyStores}
        options={{ 
          title: "📍 Toko Terdekat",
          headerStyle: {
            backgroundColor: '#e3f2fd',
          },
        }}
      />
      <Stack.Screen 
        name="CourierTracking" 
        component={ProtectedCourierTracking}
        options={{ 
          title: "🚚 Live Tracking",
          headerStyle: {
            backgroundColor: '#fff3cd',
          },
        }}
      />
    </Stack.Navigator>
  );
}