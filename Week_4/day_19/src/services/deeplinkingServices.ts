// src/services/deepLinkingService.ts - ENHANCED VERSION
import { Linking, Platform, Alert, AppState, EmitterSubscription, NativeEventSubscription } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { authService } from './authService';
import { authUtils } from '../utils/auth';

// TAMBAH: Interface untuk deep link event handlers
interface DeepLinkEventHandler {
  url: string;
  handler: (params: any) => Promise<void>;
}

// TAMBAH: Interface untuk pending deep link
interface PendingDeepLink {
  url: string;
  timestamp: number;
  action: string;
  params: any;
}

export class DeepLinkingService {
  private static instance: DeepLinkingService;
  private eventHandlers: DeepLinkEventHandler[] = [];
  private isInitialized = false;
  private navigationRef: NavigationContainerRef<any> | null = null;
  private linkingSubscription: EmitterSubscription | null = null;
  private appStateSubscription: NativeEventSubscription | null = null;
  
  // TAMBAH: Storage untuk pending deep links
  private pendingDeepLink: PendingDeepLink | null = null;
  private readonly PENDING_DEEP_LINK_KEY = 'pending_deep_link';

  static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  // Method setNavigationRef
  setNavigationRef(ref: NavigationContainerRef<any>): void {
    this.navigationRef = ref;
    console.log('✅ Navigation ref set for deep linking');
  }

  // TAMBAH: Enhanced initialize method dengan pending link recovery
  initialize(): void {
    if (this.isInitialized) {
      console.log('🔗 Deep linking already initialized');
      return;
    }

    console.log('🔗 Initializing enhanced deep linking service...');
    
    // Load pending deep link dari storage
    this.loadPendingDeepLink();
    
    // Handle deep links when app is opened from background/quit
    Linking.getInitialURL().then((url: string | null) => {
      if (url) {
        console.log('🔗 App opened with deep link:', url);
        this.handleDeepLink(url);
      }
    }).catch((error: any) => {
      console.error('❌ Error getting initial URL:', error);
    });

    // Handle deep links when app is running in foreground/background
    this.linkingSubscription = Linking.addEventListener('url', this.handleUrlEvent);

    // Handle app state changes untuk warm start
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    this.isInitialized = true;
    console.log('✅ Enhanced deep linking service initialized');
  }

  // TAMBAH: Enhanced cleanup
  cleanup(): void {
    console.log('🧹 Cleaning up deep linking listeners');
    
    if (this.linkingSubscription) {
      this.linkingSubscription.remove();
      this.linkingSubscription = null;
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    this.eventHandlers = [];
    this.navigationRef = null;
    this.isInitialized = false;
  }

  // Handle URL events
  private handleUrlEvent = (event: { url: string }): void => {
    console.log('🔗 Deep link event received:', event.url);
    this.handleDeepLink(event.url);
  };

  // Handle app state changes untuk warm start
  private handleAppStateChange = (nextAppState: string): void => {
    console.log('📱 App state changed:', nextAppState);
    
    if (nextAppState === 'active') {
      // App menjadi active, cek jika ada pending deep link
      this.checkPendingDeepLink();
    }
  };

  // TAMBAH: Enhanced check for pending deep links
  private async checkPendingDeepLink(): Promise<void> {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log('🔗 Pending deep link found:', url);
        this.handleDeepLink(url);
      }
      
      // Cek juga stored pending deep link
      if (this.pendingDeepLink) {
        console.log('🔗 Processing stored pending deep link:', this.pendingDeepLink);
        await this.processStoredPendingLink();
      }
    } catch (error) {
      console.error('❌ Error checking pending deep link:', error);
    }
  }

  // TAMBAH: Enhanced deep link handler dengan validation & auth
  private async handleDeepLink(url: string): Promise<boolean> {
    try {
      console.log(`🔗 Processing deep link: ${url}`);
      
      // Parse URL untuk menentukan jenis action
      const parsedUrl = this.parseDeepLink(url);
      
      if (!parsedUrl) {
        console.log('❌ Invalid deep link format');
        this.showErrorAlert('Tautan tidak valid, dialihkan ke beranda', () => {
          this.navigateToHome();
        });
        return false;
      }

      // TAMBAH: Validasi parameter
      const validationResult = this.validateDeepLinkParams(parsedUrl);
      if (!validationResult.isValid) {
        console.log(`❌ Invalid deep link parameters: ${validationResult.error}`);
        this.showErrorAlert(validationResult.error || 'Tautan tidak valid, dialihkan ke beranda', () => {
          this.navigateToHome();
        });
        return false;
      }

      // TAMBAH: Cek authentication untuk protected routes
      const requiresAuth = this.isProtectedRoute(parsedUrl.action);
      const isAuthenticated = await authService.isUserLoggedIn();
      
      if (requiresAuth && !isAuthenticated) {
        console.log('🔐 Protected route detected, user not authenticated');
        
        // Simpan deep link sebagai pending
        await this.storePendingDeepLink(url, parsedUrl);
        
        // Redirect ke login screen
        this.navigateToLogin(parsedUrl);
        return false;
      }

      // Cek custom event handlers terlebih dahulu
      for (const handler of this.eventHandlers) {
        if (url.includes(handler.url)) {
          console.log(`🎯 Using custom handler for: ${handler.url}`);
          await handler.handler(parsedUrl.params);
          return true;
        }
      }

      // Handle add-to-cart action secara khusus
      if (parsedUrl.action === 'add-to-cart') {
        console.log(`🛒 Add-to-cart action detected for product: ${parsedUrl.params.id}`);
        // Event akan dihandle oleh component yang register handler
        return true;
      }

      // Default handling untuk navigation deep links
      return await this.handleNormalDeepLink(url, parsedUrl);
      
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
      this.showErrorAlert('Gagal memproses tautan', () => {
        this.navigateToHome();
      });
      return false;
    }
  }

  // TAMBAH: Enhanced parameter validation
  private validateDeepLinkParams(parsedUrl: { action: string; params: any }): { 
    isValid: boolean; 
    error?: string 
  } {
    const { action, params } = parsedUrl;
    
    switch (action) {
      case 'produk':
      case 'product':
        if (!params.id) {
          return { isValid: false, error: 'ID produk tidak ditemukan dalam tautan' };
        }
        
        // Validasi ID produk harus angka
        const productId = parseInt(params.id, 10);
        if (isNaN(productId) || productId <= 0) {
          return { 
            isValid: false, 
            error: `ID produk "${params.id}" tidak valid. ID harus berupa angka.` 
          };
        }
        
        // Validasi range ID (contoh: 1-1000)
        if (productId > 1000) {
          return { 
            isValid: false, 
            error: `ID produk "${params.id}" tidak ditemukan.` 
          };
        }
        break;
        
      case 'profil':
      case 'profile':
        if (params.userId && !/^[a-zA-Z0-9_]{3,20}$/.test(params.userId)) {
          return { 
            isValid: false, 
            error: `User ID "${params.userId}" tidak valid.` 
          };
        }
        break;
        
      case 'add-to-cart':
        if (!params.id) {
          return { isValid: false, error: 'ID produk tidak ditemukan dalam tautan' };
        }
        
        const cartProductId = parseInt(params.id, 10);
        if (isNaN(cartProductId) || cartProductId <= 0) {
          return { 
            isValid: false, 
            error: `ID produk "${params.id}" tidak valid.` 
          };
        }
        break;
    }
    
    return { isValid: true };
  }

  // Parse deep link URL
  private parseDeepLink(url: string): { action: string; params: any } | null {
    try {
      console.log(`🔍 Parsing deep link: ${url}`);
      
      // Handle custom scheme: ecommerceapp://add-to-cart/55
      if (url.startsWith('ecommerceapp://') || url.startsWith('miniecom://')) {
        const path = url.replace(/^(ecommerceapp|miniecom):\/\//, '');
        const [action, ...paramParts] = path.split('/');
        
        const params: any = {};
        if (paramParts.length > 0) {
          params.id = paramParts[0];
        }
        
        // Parse query parameters
        const queryString = url.split('?')[1];
        if (queryString) {          
          const queryParams = this.parseQueryParams(queryString);
          Object.assign(params, queryParams);
          console.log('Parsed query params:', queryParams);
        }
        
        return { action, params };
      }
      
      // Handle universal links: https://ecommerceapp.com/add-to-cart/55
      if (url.includes('ecommerceapp.com/')) {
        const path = url.split('ecommerceapp.com/')[1];
        const [action, ...paramParts] = path.split('/');
        
        const params: any = {};
        if (paramParts.length > 0) {
          params.id = paramParts[0];
        }
        
        // Handle query parameters
        const queryString = url.split('?')[1];
        if (queryString) {          
          const queryParams = this.parseQueryParams(queryString);
          Object.assign(params, queryParams);
          console.log('Parsed query params:', queryParams);
        }
        
        return { action, params };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }

  // TAMBAH: Enhanced normal deep link handling dengan navigation ref
  private async handleNormalDeepLink(url: string, parsedUrl: any): Promise<boolean> {
    try {
      console.log(`📍 Handling normal deep link: ${parsedUrl.action}`, parsedUrl.params);
      
      // Jika navigationRef tersedia, gunakan untuk navigasi
      if (this.navigationRef) {
        return await this.handleNavigationDeepLink(parsedUrl);
      } else {
        console.warn('⚠️ Navigation ref not available, using fallback handling');
        return await this.handleFallbackDeepLink(parsedUrl);
      }
      
    } catch (error) {
      console.error('Error handling normal deep link:', error);
      return false;
    }
  }

  // TAMBAH: Enhanced navigation deep link handling
  private async handleNavigationDeepLink(parsedUrl: any): Promise<boolean> {
    if (!this.navigationRef) {
      console.warn('⚠️ Navigation ref not set');
      return false;
    }

    try {
      const { action, params } = parsedUrl;
      
      switch (action) {
        case 'home':
          this.navigationRef.navigate('MainDrawer');
          console.log('🏠 Navigated to home');
          break;
          
        case 'produk':
        case 'product':
          if (params.id) {
            const productId = parseInt(params.id, 10);
            this.navigationRef.navigate('ProductDetail', { 
              productId: productId,
              id: params.id // Keep original for reference
            });
            console.log(`📦 Navigated to product: ${productId}`);
          }
          break;
          
        case 'keranjang':
        case 'cart':
          this.navigationRef.navigate('Cart');
          console.log('🛒 Navigated to cart');
          break;
          
        case 'profil':
        case 'profile':
          if (params.userId) {
            this.navigationRef.navigate('Profile', { userId: params.userId });
            console.log(`👤 Navigated to profile: ${params.userId}`);
          } else {
            this.navigationRef.navigate('Profile');
            console.log('👤 Navigated to profile');
          }
          break;
          
        case 'wishlist':
          this.navigationRef.navigate('Wishlist');
          console.log('❤️ Navigated to wishlist');
          break;
          
        case 'statistik':
        case 'stats':
          this.navigationRef.navigate('UserStats');
          console.log('📊 Navigated to stats');
          break;
          
        case 'katalog':
        case 'catalog':
          this.navigationRef.navigate('ProductList');
          console.log('📚 Navigated to catalog');
          break;
          
        default:
          console.log(`ℹ️ No specific handler for action: ${action}`);
          this.showErrorAlert(`Tautan "${action}" tidak dikenali`, () => {
            this.navigateToHome();
          });
          return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Navigation deep link error:', error);
      this.showErrorAlert('Gagal membuka halaman', () => {
        this.navigateToHome();
      });
      return false;
    }
  }

  // Fallback handling tanpa navigationRef
  private async handleFallbackDeepLink(parsedUrl: any): Promise<boolean> {
    const { action, params } = parsedUrl;
    
    switch (action) {
      case 'home':
        console.log('🏠 Fallback: Navigate to home');
        break;
      case 'produk':
        console.log(`📦 Fallback: Navigate to product: ${params.id}`);
        break;
      case 'keranjang':
        console.log('🛒 Fallback: Navigate to cart');
        break;
      default:
        console.log(`ℹ️ Fallback: No handler for ${action}`);
    }
    
    return true;
  }

  // TAMBAH: Method untuk navigate ke home
  private navigateToHome(): void {
    if (this.navigationRef) {
      this.navigationRef.navigate('MainDrawer');
    }
  }

  // TAMBAH: Method untuk navigate ke login dengan pending deep link
  private navigateToLogin(parsedUrl: any): void {
    if (this.navigationRef) {
      this.navigationRef.navigate('Onboarding1', { 
        pendingDeepLink: parsedUrl 
      });
    }
  }

  // TAMBAH: Method untuk store pending deep link
  private async storePendingDeepLink(url: string, parsedUrl: any): Promise<void> {
    try {
      this.pendingDeepLink = {
        url,
        timestamp: Date.now(),
        action: parsedUrl.action,
        params: parsedUrl.params
      };
      
      // Simpan ke AsyncStorage untuk persistence
      const pendingLinkData = JSON.stringify(this.pendingDeepLink);
      // await AsyncStorage.setItem(this.PENDING_DEEP_LINK_KEY, pendingLinkData);
      
      console.log('💾 Pending deep link stored:', this.pendingDeepLink);
    } catch (error) {
      console.error('❌ Error storing pending deep link:', error);
    }
  }

  // TAMBAH: Method untuk load pending deep link
  private async loadPendingDeepLink(): Promise<void> {
    try {
      // const storedLink = await AsyncStorage.getItem(this.PENDING_DEEP_LINK_KEY);
      // if (storedLink) {
      //   this.pendingDeepLink = JSON.parse(storedLink);
      //   console.log('📥 Loaded pending deep link:', this.pendingDeepLink);
      // }
    } catch (error) {
      console.error('❌ Error loading pending deep link:', error);
    }
  }

  // TAMBAH: Method untuk process stored pending link
  private async processStoredPendingLink(): Promise<void> {
    if (!this.pendingDeepLink) return;
    
    try {
      const isAuthenticated = await authService.isUserLoggedIn();
      if (isAuthenticated) {
        console.log('🔄 Processing stored pending deep link after login');
        await this.handleDeepLink(this.pendingDeepLink.url);
        
        // Clear pending deep link setelah diproses
        this.clearPendingDeepLink();
      }
    } catch (error) {
      console.error('❌ Error processing stored pending link:', error);
    }
  }

  // TAMBAH: Method untuk clear pending deep link
  clearPendingDeepLink(): void {
    this.pendingDeepLink = null;
    // AsyncStorage.removeItem(this.PENDING_DEEP_LINK_KEY);
    console.log('🧹 Pending deep link cleared');
  }

  // TAMBAH: Method untuk execute pending deep link setelah login
  async executePendingDeepLinkAfterLogin(): Promise<boolean> {
    if (!this.pendingDeepLink) {
      console.log('ℹ️ No pending deep link to execute');
      return false;
    }
    
    try {
      console.log('🔄 Executing pending deep link after login');
      const success = await this.handleDeepLink(this.pendingDeepLink.url);
      
      if (success) {
        this.clearPendingDeepLink();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error executing pending deep link:', error);
      return false;
    }
  }

  // TAMBAH: Enhanced error alert dengan callback
  private showErrorAlert(message: string, onPress?: () => void): void {
    if (Platform.OS === 'web') return;
    
    Alert.alert(
      'Peringatan',
      message,
      [
        { 
          text: 'OK', 
          onPress: onPress || (() => {})
        }
      ]
    );
  }

  // Register custom event handlers
  registerEventHandler(urlPattern: string, handler: (params: any) => Promise<void>): void {
    this.eventHandlers.push({ url: urlPattern, handler });
    console.log(`✅ Registered handler for: ${urlPattern}`);
  }

  // Remove event handler
  removeEventHandler(urlPattern: string): void {
    this.eventHandlers = this.eventHandlers.filter(handler => handler.url !== urlPattern);
    console.log(`🗑️ Removed handler for: ${urlPattern}`);
  }

  // TAMBAH: Generate add-to-cart deep link
  generateAddToCartLink(productId: number): string {
    return `ecommerceapp://add-to-cart/${productId}`;
  }

  // TAMBAH: Test deep link functionality
  async testAddToCartDeepLink(productId: number = 1): Promise<boolean> {
    try {
      const testUrl = this.generateAddToCartLink(productId);
      console.log(`🧪 Testing add-to-cart deep link: ${testUrl}`);
      
      const canOpen = await this.canOpenURL(testUrl);
      if (canOpen) {
        console.log('✅ Add-to-cart deep link test passed');
        return true;
      } else {
        console.log('❌ Add-to-cart deep link test failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Add-to-cart deep link test error:', error);
      return false;
    }
  }

  // ========== EXISTING METHODS ==========
  
  async canOpenURL(url: string): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      console.log(`🔗 Can open URL ${url}: ${canOpen}`);
      return canOpen;
    } catch (error) {
      console.error('❌ Error checking URL:', error);
      return false;
    }
  }

  async openDeepLink(url: string, fallbackUrl?: string): Promise<void> {
    try {
      const canOpen = await this.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        console.log(`✅ Deep link opened: ${url}`);
      } else if (fallbackUrl) {
        console.log(`🔄 Falling back to: ${fallbackUrl}`);
        await Linking.openURL(fallbackUrl);
      } else {
        Alert.alert('Error', 'Tidak dapat membuka tautan');
      }
    } catch (error) {
      console.error('❌ Error opening deep link:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membuka tautan');
    }
  }

  generateDeepLink(route: string, params?: Record<string, string>): string {
    let url = `ecommerceapp://${route}`;
    
    if (params) {
      const queryParts: string[] = [];
      Object.keys(params).forEach(key => {
        if (params[key]) {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        }
      });
      
      if (queryParts.length > 0) {
        url += `?${queryParts.join('&')}`;
      }
    }
    
    return url;
  }

  generateUniversalLink(route: string, params?: Record<string, string>): string {
    let url = `https://ecommerceapp.com/${route}`;
    
    if (params) {
      const queryParts: string[] = [];
      Object.keys(params).forEach(key => {
        if (params[key]) {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        }
      });
      
      if (queryParts.length > 0) {
        url += `?${queryParts.join('&')}`;
      }
    }
    
    return url;
  }

  troubleshootDeepLinkingIssue(issue: string): string {
    const issues: Record<string, string> = {
      'android_not_opening': 'Pastikan intent filter sudah dikonfigurasi di AndroidManifest.xml',
      'ios_not_opening': 'Pastikan URL scheme sudah ditambahkan di Info.plist',
      'parameter_missing': 'Parameter tidak terbaca, pastikan format URL benar',
      'app_not_installed': 'Aplikasi tidak terinstall, gunakan universal links',
      'url_parsing_error': 'Format URL tidak valid, periksa struktur deep link',
    };

    return issues[issue] || 'Unknown issue, check console for details';
  }

  isProtectedRoute(route: string): boolean {
    const protectedRoutes = ['cart', 'checkout', 'keranjang', 'payment', 'address', 'add-to-cart'];
    return protectedRoutes.some(protectedRoute => 
      route.toLowerCase().includes(protectedRoute)
    );
  }

  async handleDeepLinkWithAuth(url: string, navigation: any): Promise<boolean> {
    try {
      console.log(`🔗 Handling deep link: ${url}`);
      
      const route = this.extractRouteFromUrl(url);
      console.log(`📍 Extracted route: ${route}`);
      
      if (this.isProtectedRoute(route)) {
        const isLoggedIn = await authService.isUserLoggedIn();
        
        if (!isLoggedIn) {
          console.log('🔐 Protected route detected, user not authenticated');
          Alert.alert(
            'Login Diperlukan',
            'Anda harus login terlebih dahulu untuk mengakses fitur ini.',
            [
              { 
                text: 'Login', 
                onPress: () => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding1' }],
                })
              },
              { text: 'Batal', style: 'cancel' }
            ]
          );
          return false;
        }
      }
      
      return await this.handleNormalDeepLink(url, { action: route, params: {} });
      
    } catch (error) {
      console.error('❌ Error handling deep link with auth:', error);
      return false;
    }
  }

  private extractRouteFromUrl(url: string): string {
    try {
      if (url.startsWith('ecommerceapp://')) {
        return url.replace('ecommerceapp://', '').split('?')[0];
      }
      
      if (url.includes('ecommerceapp.com/')) {
        const parts = url.split('ecommerceapp.com/');
        return parts[1]?.split('?')[0] || '';
      }
      
      return url;
    } catch (error) {
      console.error('Error extracting route from URL:', error);
      return '';
    }
  }

  // Method helper untuk manual URLSearchParams iteration
  private parseQueryParams(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    if (!queryString) return params;
    
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
    
    return params;
  }

  // TAMBAH: Enhanced status method
  getStatus(): { 
    isInitialized: boolean; 
    handlersCount: number;
    hasNavigationRef: boolean;
    hasPendingDeepLink: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      handlersCount: this.eventHandlers.length,
      hasNavigationRef: this.navigationRef !== null,
      hasPendingDeepLink: this.pendingDeepLink !== null
    };
  }
}

export const deepLinkingService = DeepLinkingService.getInstance();