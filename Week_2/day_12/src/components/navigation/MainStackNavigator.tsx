import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "../../screens/main/Home";
import ProductDetail from "../../screens/main/ProductDetail";
import AddProduct from "../../screens/main/AddProduct";
import Checkout from "../../screens/main/Checkout";
import Cart from "../../screens/main/Cart";
import AddressForm from "../../screens/main/AddressForm";
import Payment from "../../screens/main/Payment";
import { MainStackParamList } from "../../types/navigation";

const Stack = createStackNavigator<MainStackParamList>();

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
      <Stack.Screen 
        name="Cart" 
        component={Cart}
        options={{ 
          title: "🛒 Keranjan",
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
      <Stack.Screen 
        name="Checkout" 
        component={Checkout}
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}