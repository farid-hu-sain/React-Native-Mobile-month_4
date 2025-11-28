

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { UserStatsProvider } from './src/components(day12)/src/context/UserStatsContext';
import { CartProvider } from './src/components(day12)/src/context/CartContext';
import StackNavigator from './src/components(day12)/src/components/navigation/StackNavigator';


export default function App() {
  return (
    <UserStatsProvider>
      <CartProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </CartProvider>
    </UserStatsProvider>
  );
}