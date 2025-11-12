import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PopularTab from '../../screens/tabs/PopularTab';
import NewTab from '../../screens/tabs/NewTab';
import DiscountTab from '../../screens/tabs/DiscountTab';
import FoodTab from '../../screens/tabs/FoodTab';
import BabyTab from '../../screens/tabs/BabyTab';
import { TopTabsParamList } from '../../types/navigation';
import EntertainmentTab from '../../screens/tabs/Entertaiment';
import AutomotiveTab from '../../screens/tabs/AuthomotiveTab';
import ElectronicsTab from '../../screens/tabs/ElectronicTab';
import ClothingTab from '../../screens/tabs/ClothinngTab';

const Tab = createMaterialTopTabNavigator<TopTabsParamList>();

export default function TopTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
        tabBarLabelStyle: { textTransform: 'none', fontSize: 14 },
        tabBarScrollEnabled: true,
        tabBarItemStyle: { width: 'auto' },      
        lazy: true,
        lazyPreloadDistance: 1,
      }}
    >
      <Tab.Screen 
        name="Popular" 
        component={PopularTab} 
        options={{ 
          title: 'Populer'
        }} 
      />
      <Tab.Screen 
        name="New" 
        component={NewTab} 
        options={{ title: 'Terbaru' }} 
      />
      <Tab.Screen 
        name="Discount" 
        component={DiscountTab} 
        options={{ title: 'Diskon' }} 
      />
      <Tab.Screen 
        name="Electronics" 
        component={ElectronicsTab} 
        options={{ title: 'Elektronik' }} 
      />
      <Tab.Screen 
        name="Clothing" 
        component={ClothingTab} 
        options={{ title: 'Pakaian' }} 
      />
      <Tab.Screen 
        name="Food" 
        component={FoodTab} 
        options={{ title: 'Makanan' }} 
      />
      <Tab.Screen 
        name="Automotive" 
        component={AutomotiveTab} 
        options={{ title: 'Otomotif' }} 
      />
      <Tab.Screen 
        name="Entertainment" 
        component={EntertainmentTab} 
        options={{ title: 'Hiburan' }} 
      />
      <Tab.Screen 
        name="Baby" 
        component={BabyTab} 
        options={{ title: 'Perlengkapan Bayi' }} 
      />
    </Tab.Navigator>
  );
}