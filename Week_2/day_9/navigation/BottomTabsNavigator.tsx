import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProductCatalog from "../screens/ProductCatalog";
import Profile from "../screens/Profile";
import Icon from "@react-native-vector-icons/fontawesome6";


export type BottomTabsParamList = {
  ProductCatalog: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabsParamList>();

export default function BottomTabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="ProductCatalog"  
        component={ProductCatalog} 
        options={{ 
          tabBarIcon: ({color, size, focused}) => <Icon name="book" size={16} iconStyle="solid" color={color} />
                }} />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{ 
          tabBarIcon: ({color, size, focused}) => <Icon name="user" size={16} iconStyle="solid" color={color} />
                  }} />
    </Tab.Navigator>
  );
}

