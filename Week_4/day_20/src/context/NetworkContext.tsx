// src/context/NetworkContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';

type NetworkState = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
};

type NetworkContextType = {
  netInfo: NetworkState;
  hasCheckedConnection: boolean;
  showGlobalBanner: boolean;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [netInfo, setNetInfo] = useState<NetworkState>({
    isConnected: null,
    isInternetReachable: null,
    type: 'unknown'
  });
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const [showGlobalBanner, setShowGlobalBanner] = useState(false);

  useEffect(() => {
    console.log('🔄 NetworkProvider: Setting up NetInfo listener');
    
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('📡 Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      });
      
      const newNetInfo = {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      };
      
      setNetInfo(newNetInfo);

      // Logic untuk banner global - FIXED VERSION
      if (state.isInternetReachable === false) {
        console.log('🔴 OFFLINE DETECTED: Setting showGlobalBanner to TRUE');
        setShowGlobalBanner(true);
      } else if (state.isInternetReachable === true) {
        console.log('🟢 ONLINE DETECTED: Setting showGlobalBanner to FALSE');
        setShowGlobalBanner(false);
      }
    });

    // Initial network check
    const checkInitialNetwork = async () => {
      try {
        console.log('🚀 Checking initial network state...');
        const state = await NetInfo.fetch();
        console.log('📊 Initial network state:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type
        });
        
        const initialNetInfo = {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type
        };
        
        setNetInfo(initialNetInfo);
        setHasCheckedConnection(true);
        
        // Set initial banner state
        if (state.isInternetReachable === false) {
          console.log('🔴 INITIAL OFFLINE: Setting showGlobalBanner to TRUE');
          setShowGlobalBanner(true);
        } else {
          console.log('🟢 INITIAL ONLINE: Setting showGlobalBanner to FALSE');
          setShowGlobalBanner(false);
        }
      } catch (error) {
        console.error('❌ Error checking initial network:', error);
        setHasCheckedConnection(true);
      }
    };

    checkInitialNetwork();

    return () => {
      console.log('🧹 NetworkProvider: Cleaning up NetInfo listener');
      unsubscribe();
    };
  }, []); // Removed showGlobalBanner from dependencies to avoid loops

  const contextValue = {
    netInfo,
    hasCheckedConnection,
    showGlobalBanner
  };

  console.log('📊 NetworkProvider Current State:', contextValue);

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};