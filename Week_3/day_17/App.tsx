// import React, { useState } from 'react';
import SampleList from './src/components(day4)/ScrollView_RefreshControl';
import FlatListExample from './src/components(day4)/FlatList_ViewAbility';
import HeroSection from './src/components(day3)/HeroSection';
import ProfilCard from './src/components(day3)/CardProfile';
import LoginForm from './src/components(day3)/FromLogin';
import SectionListExample from './src/components(day4)/SectionList_StickyHeaders';
import InteractiveButtons from './src/components(day5)/Button_Pressable';
import FeedbackButtons from './src/components(day5)/TouchableOpacity_Highlight';
import AdvancedTouches from './src/components(day5)/LongPress_NativeFeedback';
import { FlexboxPlayground } from './src/components(day7)/Flexbox__Playground';
import RootNavigator from './src/routes/RootNavigator';





// export default function App() {
//   return(
//     <>
//     {/* <ProfilCard /> */}
//     {/* <LoginForm/> */}
//     {/* <HeroSection/> */}
//     {/* <SampleList/> */}
//     {/* <FlatListExample /> */}
//     {/* <SectionListExample /> */}
//     {/* < InteractiveButtons /> */}
//     {/* <FeedbackButtons /> */}
//     {/* < AdvancedTouches /> */}
//     {/* < FlexboxPlayground /> */}
//     {/* <RootNavigator /> */}
//     </>
//   ) 

// }

// export default App;
// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import MainStackNavigator from './src/components(day11)/src/components/navigation/MainStackNavigator';
// // import StackNavigator from "./src/components(day9)/navigation/StackNavigator";
// // import RootNavigator from "./src/routes/RootNavigator";

// export default function App() {
//   return (
//     <NavigationContainer>
//       <MainStackNavigator />
//     </NavigationContainer>
//   );
// }

// App.tsx (UPDATE)
// App.tsx (UPDATE - tambahkan loading state yang better)
// App.tsx (UPDATED)
// App.tsx (FIXED)
// App.tsx (UPDATED dengan Deep Linking)
import React, { useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import ErrorBoundary from './src/components(day12)/src/components/common/ErrorBoundary';
import { NetworkProvider } from './src/components(day12)/src/context/NetworkContext';
import { AuthProvider } from './src/components(day12)/src/context/AuthContext';
import { UserStatsProvider } from './src/components(day12)/src/context/UserStatsContext';
import { CartProvider } from './src/components(day12)/src/context/CartContext';
import GlobalNetworkBanner from './src/components(day12)/src/components/common/GlobalNetworkBanner';
import StackNavigator from './src/components(day12)/src/components/navigation/StackNavigator';
import { initializeApiKey } from './src/components(day12)/src/services/apiClient';

// Splash Screen Component dengan status loading
const SplashScreen = ({ status }: { status: string }) => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10, color: '#666' }}>
      {status}
    </Text>
  </View>
);

// 1. KONFIGURASI DEEP LINKING DASAR
const linking = {
  prefixes: [
    'ecommerceapp://', // Custom scheme
    'https://ecommerceapp.com', // Universal Links (fallback)
    'https://*.ecommerceapp.com', // Domain wildcard
  ],
  
  // 2. INTEGRASI DEEP LINKING DENGAN REACT NAVIGATION
  config: {
    screens: {
      // Deep linking untuk stack navigator
      Onboarding1: 'onboarding',
      Onboarding2: 'onboarding/step2',
      
      // Main Drawer dengan nested navigation
      MainDrawer: {
        screens: {
          // Home deep link
          MainTabs: {
            screens: {
              HomeStack: 'home',
            }
          },
        }
      },
      
      // 2. DEEP LINKING UNTUK HALAMAN PRODUK
      ProductDetail: 'produk/:id',
      
      // 3. PENANGANAN WARM START - langsung ke keranjang
      Cart: 'keranjang',
      
      // 4. VALIDASI PARAMETER PROFIL
      Profile: 'profil/:userId',
      
      // Additional deep links
      UserStats: 'statistik',
      ProductList: 'katalog',
      Checkout: 'checkout',
    },
  },
};

export default function App() {
  const [appKey, setAppKey] = useState(0);
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Menginisialisasi aplikasi...');
  const navigationRef = useRef<any>();

  const handleAppReset = () => {
    setAppKey(prevKey => prevKey + 1);
    console.log('🔄 App reset triggered from Error Boundary');
  };

  // 3. PENANGANAN WARM START & INITIAL URL
  const handleDeepLink = (url: string | null) => {
    if (url) {
      console.log('🔗 Deep link received:', url);
      
      // Extract route dari URL
      const route = url.replace(/.*?:\/\//g, '');
      console.log('📍 Parsed route:', route);
      
      // Bisa tambahkan analytics tracking di sini
      // analytics.track('deep_link_opened', { url, route });
    }
  };

  // Hybrid storage initialization dengan deep linking setup
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoadingStatus('Menyiapkan keamanan...');
        
        // Initialize secure API Key
        await initializeApiKey();
        
        setLoadingStatus('Mengkonfigurasi deep linking...');
        
        // 5. TROUBLESHOOTING - Get initial URL untuk cold start
        const initialUrl = await Linking.getInitialURL();
        handleDeepLink(initialUrl);
        
        // Setup event listener untuk warm start
        const subscription = Linking.addEventListener('url', ({ url }) => {
          handleDeepLink(url);
        });
        
        setLoadingStatus('Memuat data pengguna...');
        
        setTimeout(() => {
          setIsAppReady(true);
        }, 1500);
        
        // Cleanup subscription
        return () => subscription.remove();
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setTimeout(() => {
          setIsAppReady(true);
        }, 1000);
      }
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
    return <SplashScreen status={loadingStatus} />;
  }

  return (
    <ErrorBoundary key={appKey} onReset={handleAppReset}>
      <NetworkProvider>
        <AuthProvider>
          <UserStatsProvider>
            <CartProvider>
              <NavigationContainer
                ref={navigationRef}
                linking={linking}
                fallback={<SplashScreen status="Memuat..." />}
                onReady={() => {
                  console.log('✅ Navigation ready, deep linking aktif');
                }}
                onStateChange={(state) => {
                  // Debug navigation state changes
                  console.log('🧭 Navigation state changed:', state);
                }}
              >
                <GlobalNetworkBanner />
                <StackNavigator />
              </NavigationContainer>
            </CartProvider>
          </UserStatsProvider>
        </AuthProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}