

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { UserStatsProvider } from './src/components(day12)/src/context/UserStatsContext';
import { CartProvider } from './src/components(day12)/src/context/CartContext';
import StackNavigator from './src/components(day12)/src/components/navigation/StackNavigator';
import { NetworkProvider } from './src/components(day12)/src/context/NetworkContext';
import ErrorBoundary from './src/components(day12)/src/components/common/ErrorBoundary';

export default function App() {
  const [appKey, setAppKey] = useState(0);

  const handleAppReset = () => {
    // Reset app key untuk force re-render seluruh aplikasi
    setAppKey(prevKey => prevKey + 1);
    console.log('🔄 App reset triggered from Error Boundary');
  };

  return (
    <ErrorBoundary key={appKey} onReset={handleAppReset}>
      <NetworkProvider>
        <UserStatsProvider>
          <CartProvider>
            <NavigationContainer>
              <StackNavigator />
            </NavigationContainer>
          </CartProvider>
        </UserStatsProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}