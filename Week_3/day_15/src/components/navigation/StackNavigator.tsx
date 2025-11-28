// src/components/navigation/StackNavigator.tsx (FIXED VERSION)
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import Onboarding1 from "../../screens/onboarding/Onboarding1";
import Onboarding2 from "../../screens/onboarding/Onboarding2";
import DrawerNavigator from "./DrawerNavigator";
import { RootStackParamList } from "../../types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

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
      {/* Define ALL screens from RootStackParamList */}
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
      
      {/* Add placeholder screens for other routes in RootStackParamList */}
      <Stack.Screen 
        name="ProductDetail" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Product Detail Screen</Text>
            <Text>Implement product detail functionality here</Text>
          </View>
        )} 
      />
      <Stack.Screen 
        name="AddProduct" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Add Product Screen</Text>
          </View>
        )} 
      />
      <Stack.Screen 
        name="Checkout" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Checkout Screen</Text>
          </View>
        )} 
      />
      <Stack.Screen 
        name="Cart" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Cart Screen</Text>
          </View>
        )} 
      />
      <Stack.Screen 
        name="AddressForm" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Address Form Screen</Text>
          </View>
        )} 
      />
      <Stack.Screen 
        name="Payment" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Payment Screen</Text>
          </View>
        )} 
      />
      <Stack.Screen 
        name="UserStats" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>User Stats Screen</Text>
          </View>
        )} 
      />
      <Stack.Screen 
        name="ProductList" 
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Product List Screen</Text>
          </View>
        )} 
      />
    </Stack.Navigator>
  );
}