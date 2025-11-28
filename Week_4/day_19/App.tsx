// App.tsx (FIXED VERSION WITH GESTURE HANDLER)
import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { View, Text, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // IMPORT HARUS DI SINI
import { StartupService } from './src/utils/startupService';
import { initializeApiKey } from './src/services/apiClient';
import { productService } from './src/services/productService';
import { deepLinkingService } from './src/services/deeplinkingServices';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import StorageHealthBanner from './src/components/common/StorageHealthBanner';
import GlobalNetworkBanner from './src/components/common/GlobalNetworkBanner';
import StackNavigator from './src/components/navigation/StackNavigator';
import { storageService } from './src/services/storageService';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { NetworkProvider } from './src/context/NetworkContext';
import { UserStatsProvider } from './src/context/UserStatsContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { STORAGE_KEYS } from './src/constants/config';

// ✅ FIXED: Definisi theme yang lengkap dan valid
const AppTheme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    background: '#ffffff',
    card: '#f8f8f8',
    text: '#000000',
    border: '#e0e0e0',
    notification: '#FF3B30',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
  },
};

// Enhanced Splash Screen Component dengan progress tracking
const SplashScreen = ({ status, progress }: { status: string; progress?: number }) => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#007AFF' }}>
      🛍️ E-Commerce App
    </Text>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 20, color: '#666', textAlign: 'center', paddingHorizontal: 20 }}>
      {status}
    </Text>
    {progress !== undefined && (
      <View style={{ marginTop: 20, width: '80%' }}>
        <View style={{ 
          height: 6, 
          backgroundColor: '#E5E5E5', 
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <View style={{ 
            height: '100%', 
            backgroundColor: '#007AFF', 
            width: `${progress}%`,
            borderRadius: 3
          }} />
        </View>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 }}>
          {Math.round(progress)}% selesai
        </Text>
      </View>
    )}
  </View>
);

// Enhanced Service untuk manage startup hydration dengan storage health
class StartupHydrationService {
  private totalTasks = 0;
  private completedTasks = 0;
  private progressCallbacks: ((progress: number) => void)[] = [];
  private startupResult: any = null;

  constructor() {
    // Define semua tasks yang perlu di-load pada startup
    this.totalTasks = 7; // Security, Storage Health, Network, Auth, Cart, Cache, Deep Linking
  }

  registerProgressCallback(callback: (progress: number) => void) {
    this.progressCallbacks.push(callback);
  }

  private updateProgress() {
    this.completedTasks++;
    const progress = (this.completedTasks / this.totalTasks) * 100;
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  async initializeStorageHealth(): Promise<void> {
    try {
      console.log('🔍 Initializing storage health check...');
      
      // Jalankan comprehensive storage health check
      this.startupResult = await StartupService.initializeApp();
      
      if (this.startupResult.storageHealth?.corruptedItems > 0) {
        console.warn(`⚠️ Found ${this.startupResult.storageHealth.corruptedItems} corrupted items`);
      }
      
      this.updateProgress();
    } catch (error) {
      console.error('❌ Storage health initialization failed:', error);
      this.updateProgress();
    }
  }

  async initializeSecurity(): Promise<void> {
    try {
      console.log('🔐 Initializing security...');
      await initializeApiKey();
      this.updateProgress();
    } catch (error) {
      console.error('❌ Security initialization failed:', error);
      this.updateProgress();
    }
  }

  async initializeNetwork(): Promise<void> {
    try {
      console.log('📡 Initializing network monitoring...');
      // NetworkProvider akan handle ini secara internal
      this.updateProgress();
    } catch (error) {
      console.error('❌ Network initialization failed:', error);
      this.updateProgress();
    }
  }

  async initializeDeepLinking(): Promise<void> {
    try {
      console.log('🔗 Initializing deep linking...');
      
      // Get initial URL untuk cold start
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('🔗 App opened with deep link:', initialUrl);
      }
      
      this.updateProgress();
    } catch (error) {
      console.error('❌ Deep linking initialization failed:', error);
      this.updateProgress();
    }
  }

  async preloadProductCache(): Promise<void> {
    try {
      console.log('🚀 Preloading product cache...');
      
      // Jalankan preload cache secara non-blocking
      productService.preloadCache().catch(error => {
        console.error('❌ Cache preloading failed (non-critical):', error);
      });
      
      this.updateProgress();
    } catch (error) {
      console.error('❌ Cache preload initialization failed:', error);
      this.updateProgress();
    }
  }

  async initializeServices(): Promise<void> {
    try {
      console.log('🛠️ Initializing services...');
      
      // Initialize deep linking service
      deepLinkingService.initialize();
      
      this.updateProgress();
    } catch (error) {
      console.error('❌ Services initialization failed:', error);
      this.updateProgress();
    }
  }

  async finalizeStartup(): Promise<void> {
    try {
      console.log('🎯 Finalizing startup...');
      
      // Test deep link functionality
      await deepLinkingService.testAddToCartDeepLink(1);
      
      this.updateProgress();
    } catch (error) {
      console.error('❌ Startup finalization failed:', error);
      this.updateProgress();
    }
  }

  async executeAll(): Promise<{ success: boolean; startupResult: any }> {
    console.log('🚀 Starting comprehensive app hydration with storage health...');
    
    // Jalankan semua tasks secara sequential untuk dependencies yang benar
    await this.initializeStorageHealth();
    await this.initializeSecurity();
    await this.initializeNetwork();
    await this.initializeDeepLinking();
    await this.preloadProductCache();
    await this.initializeServices();
    await this.finalizeStartup();

    console.log('✅ All startup tasks completed');
    
    return {
      success: this.startupResult?.success !== false,
      startupResult: this.startupResult
    };
  }

  getStartupResult() {
    return this.startupResult;
  }
}

// App Content Component untuk handle storage health banner
const AppContent = () => {
  const { storageHealth, repairStorage, checkStorageHealth } = useAuth();
  const [startupCompleted, setStartupCompleted] = useState(false);
  const [startupResult, setStartupResult] = useState<any>(null);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing application with enhanced startup...');
      
      const hydrationService = new StartupHydrationService();
      const result = await hydrationService.executeAll();
      
      setStartupResult(result.startupResult);
      setStartupCompleted(true);
      
      console.log('📋 Enhanced startup result:', result);
      
      // Periodic health check (setiap 12 jam)
      const healthCheckInterval = setInterval(() => {
        checkStorageHealth();
      }, 12 * 60 * 60 * 1000);

      return () => clearInterval(healthCheckInterval);
    };

    initializeApp();
  }, [checkStorageHealth]);

  if (!startupCompleted) {
    return (
      <SplashScreen 
        status="Menginisialisasi aplikasi..." 
        progress={0}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Storage Health Banner */}
      <StorageHealthBanner 
        status={storageHealth.status}
        onRepair={repairStorage}
        lastCheck={storageHealth.lastCheck}
        corruptionCount={storageHealth.corruptionCount}
        showDetails={true}
      />
      
      {/* Global Network Banner */}
      <GlobalNetworkBanner />
      
      {/* Main App Navigation */}
      <StackNavigator />
    </View>
  );
};

// Enhanced Auth Consumer Component
const AuthAppContent = () => {
  const { initializeAuth, storageHealth } = useAuth();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const initializeAuthContext = async () => {
      try {
        console.log('🔐 Initializing auth context...');
        await initializeAuth();
        setAuthInitialized(true);
      } catch (error) {
        console.error('❌ Auth context initialization failed:', error);
        // Fallback: tetap set initialized meski ada error
        setAuthInitialized(true);
      }
    };

    initializeAuthContext();
  }, [initializeAuth]);

  if (!authInitialized) {
    return <SplashScreen status="Memuat data pengguna..." />;
  }

  return <AppContent />;
};

// Enhanced Deep Linking Configuration dengan Validation Support
const linking = {
  prefixes: [
    'ecommerceapp://', // Custom scheme
    'miniecom://', // Alternative custom scheme
    'https://ecommerceapp.com', // Universal Links (fallback)
    'https://*.ecommerceapp.com', // Domain wildcard
  ],
  
  // Enhanced Deep Linking Config dengan Parameter Validation
  config: {
    screens: {
      // Screen langsung di Root Stack
      Onboarding1: {
        path: 'onboarding',
        parse: {
          pendingDeepLink: (value: string) => {
            if (value) {
              try {
                return JSON.parse(value);
              } catch (error) {
                console.error('❌ Error parsing pendingDeepLink:', error);
                return null;
              }
            }
            return undefined;
          },
        },
      },
      Onboarding2: 'onboarding/step2',
      
      // Deep linking untuk screen utama dengan parameter validation
      Profile: {
        path: 'profil/:userId',
        parse: {
          userId: (value: string) => {
            // Validasi userId format
            const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(value);
            console.log(`🔍 Parsing userId: ${value} -> ${isValid ? 'VALID' : 'INVALID'}`);
            return isValid ? value : 'invalid';
          },
        },
      },
      ProductDetail: {
        path: 'produk/:id',
        parse: {
          id: (value: string) => {
            // Validasi productId harus angka
            const numericId = parseInt(value, 10);
            const isValid = !isNaN(numericId) && numericId > 0 && numericId <= 1000;
            console.log(`🔍 Parsing productId: ${value} -> ${isValid ? 'VALID' : 'INVALID'}`);
            return isValid ? numericId : -1;
          },
        },
      },
      Cart: 'keranjang',
      UserStats: 'statistik',
      ProductList: 'katalog',
      Checkout: 'checkout',
      Wishlist: 'wishlist',
      AddProduct: 'tambah-produk',
      AddressForm: 'alamat',
      Payment: 'pembayaran',
      
      // MainDrawer untuk nested navigation home
      MainDrawer: {
        screens: {
          MainTabs: {
            screens: {
              HomeStack: 'home',
            }
          },
        }
      },
    },
  },

  // Enhanced Custom Linking Functions
  getInitialURL: () => Linking.getInitialURL(),
  subscribe: (listener) => {
    const sub = Linking.addEventListener('url', ({ url }) => listener(url));
    return () => sub.remove();
  }
};

export default function App() {
  const [appKey, setAppKey] = useState(0);
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Menginisialisasi aplikasi...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const hydrationService = useRef(new StartupHydrationService());

  const handleAppReset = () => {
    console.log('🔄 App reset triggered from Error Boundary');
    setAppKey(prevKey => prevKey + 1);
    
    // Clear storage corruption logs on reset
    storageService.clearAllCorruptedData().catch(error => {
      console.error('❌ Error clearing corrupted data on reset:', error);
    });
  };

  // Enhanced app initialization dengan state hydration dan storage health
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🎯 Starting comprehensive app initialization with storage health...');
        
        // Setup progress tracking
        hydrationService.current.registerProgressCallback((progress: number) => {
          setLoadingProgress(progress);
          
          // Update status berdasarkan progress
          if (progress < 15) {
            setLoadingStatus('Memeriksa kesehatan penyimpanan...');
          } else if (progress < 30) {
            setLoadingStatus('Menyiapkan keamanan...');
          } else if (progress < 45) {
            setLoadingStatus('Mengkonfigurasi jaringan...');
          } else if (progress < 60) {
            setLoadingStatus('Mengatur deep linking...');
          } else if (progress < 75) {
            setLoadingStatus('Memuat data produk...');
          } else if (progress < 90) {
            setLoadingStatus('Menginisialisasi layanan...');
          } else {
            setLoadingStatus('Menyelesaikan startup...');
          }
        });

        // Execute semua startup tasks
        const result = await hydrationService.current.executeAll();
        
        if (!result.success) {
          console.warn('⚠️ Startup completed with warnings:', result.startupResult?.errors);
          
          // Tampilkan warning alert jika ada issues
          if (result.startupResult?.errors?.length > 0) {
            setTimeout(() => {
              Alert.alert(
                'Peringatan Startup',
                `Aplikasi berhasil dimuat dengan ${result.startupResult.errors.length} peringatan. Beberapa fitur mungkin tidak berfungsi optimal.`,
                [{ text: 'Mengerti' }]
              );
            }, 1000);
          }
        }
        
        console.log('✅ App initialization completed successfully');
        
        // Beri sedikit delay untuk smooth UX
        setTimeout(() => {
          setIsAppReady(true);
        }, 800);
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        
        // Fallback: tetap lanjut meski ada error dengan warning
        setTimeout(() => {
          Alert.alert(
            'Peringatan Startup',
            'Aplikasi berhasil dimuat dengan beberapa peringatan. Beberapa fitur mungkin tidak berfungsi optimal.',
            [{ text: 'Lanjutkan', onPress: () => setIsAppReady(true) }]
          );
        }, 500);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up app resources...');
      // Cleanup deep linking service
      deepLinkingService.cleanup();
    };
  }, []);

  // Show splash screen selama app belum ready
  if (!isAppReady) {
    return <SplashScreen status={loadingStatus} progress={loadingProgress} />;
  }

  return (
    // ✅ FIXED: WRAP SEMUA COMPONENT DENGAN GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary key={appKey} onReset={handleAppReset}>
        <NetworkProvider>
          <AuthProvider>
            <UserStatsProvider>
              <WishlistProvider>
                <CartProvider>
                  <NavigationContainer
                    ref={navigationRef}
                    linking={linking}
                    fallback={<SplashScreen status="Memuat navigasi..." />}
                    onReady={() => {
                      console.log('✅ Navigation ready, deep linking aktif');
                      
                      // Setup deep linking listeners setelah navigation ready
                      if (navigationRef.current) {
                        deepLinkingService.setNavigationRef(navigationRef.current);
                      }
                      
                      // Check deep linking service status
                      const deepLinkStatus = deepLinkingService.getStatus();
                      console.log('🔗 Deep Linking Status:', deepLinkStatus);
                      
                      // Test deep link functionality
                      setTimeout(() => {
                        deepLinkingService.testAddToCartDeepLink(1).then(success => {
                          if (success) {
                            console.log('✅ Deep link functionality verified');
                          } else {
                            console.warn('⚠️ Deep link functionality test failed');
                          }
                        });
                      }, 2000);
                    }}
                    onStateChange={(state) => {
                      // Debug navigation state changes (opsional, hanya di development)
                      if (__DEV__) {
                        const currentRoute = state?.routes[state.index];
                        console.log('🧭 Navigation changed to:', currentRoute?.name);
                      }
                    }}
                    documentTitle={{
                      formatter: (options, route) => 
                        `${options?.title || route?.name} - E-Commerce App`
                    }}
                    theme={AppTheme}
                  >
                    <AuthAppContent />
                  </NavigationContainer>
                </CartProvider>
              </WishlistProvider>
            </UserStatsProvider>
          </AuthProvider>
        </NetworkProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}