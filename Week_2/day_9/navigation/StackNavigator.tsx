import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Onboarding1 from "../screens/Onboarding1";
import Onboarding2 from "../screens/Onboarding2";
import BottomTabsNavigator from "./BottomTabsNavigator";
import ProductDetail from "../screens/ProductDetail";
import AddProduct from "../screens/AddProduct";

export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  MainTabs: undefined;
  ProductDetail: { product: any };
  AddProduct: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="MainTabs" component={BottomTabsNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="AddProduct" component={AddProduct} />
    </Stack.Navigator>
  );
}
