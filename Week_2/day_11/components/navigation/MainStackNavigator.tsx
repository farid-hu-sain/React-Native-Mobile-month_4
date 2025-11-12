import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "../../screens/main/Home";
import ProductDetail from "../../screens/main/ProductDetail";
import AddProduct from "../../screens/main/AddProduct";
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
        }
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={Home}
        options={{ 
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetail}
        options={{ 
          title: "📦 Product Detail",
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProduct}
        options={{ 
          title: "➕ Add Product",
          headerShown: true
        }}
      />
    </Stack.Navigator>
  );
}