// src/context/CartContext.tsx (MEMORY LEAK FIXED)
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, cartManager } from '../utils/cart';
import { STORAGE_KEYS, CART_QUOTA_LIMIT } from '../constants/config';
import { productService } from '../services/productService';
import { storageService } from '../services/storageService';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  lastError: string | null;
  isNearQuota: boolean;
  // Deep link features
  addToCartFromDeepLink: (productId: number) => Promise<void>;
  isProcessingDeepLink: boolean;
  // Storage corruption features
  storageCorrupted: boolean;
  initializeCart: () => Promise<void>;
  repairCartStorage: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isNearQuota, setIsNearQuota] = useState(false);
  const [isProcessingDeepLink, setIsProcessingDeepLink] = useState(false);
  const [storageCorrupted, setStorageCorrupted] = useState(false);
  const isMounted = useRef(true);

  // Enhanced cart initialization dengan corruption handling
  const initializeCart = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 Starting enhanced cart initialization...');
      await loadCartFromStorage();
      console.log('✅ Enhanced cart initialization completed');
    } catch (error) {
      console.error('❌ Enhanced cart initialization failed:', error);
      throw error;
    }
  }, []);

  // Enhanced cart loading dengan corruption recovery
  const loadCartFromStorage = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 Loading cart from storage with corruption handling...');
      const storedCart = await AsyncStorage.getItem(STORAGE_KEYS.CART_ITEMS);
      
      if (storedCart) {
        // Use safe parsing untuk cart data
        const items = storageService.safeJSONParse(storedCart, [], STORAGE_KEYS.CART_ITEMS);
        
        // Validasi structure cart items
        if (Array.isArray(items) && items.every(item => 
          item && typeof item.id === 'number' && typeof item.quantity === 'number'
        )) {
          cartManager.setCartItems(items);
          setCartItems([...items]);
          setIsNearQuota(cartManager.isNearQuotaLimit());
          setStorageCorrupted(false);
          console.log('✅ Cart loaded successfully:', items.length, 'items');
        } else {
          console.warn('⚠️ Invalid cart data structure, resetting cart...');
          setStorageCorrupted(true);
          await repairCartStorage();
        }
      } else {
        console.log('ℹ️ No cart data found in storage');
        setStorageCorrupted(false);
      }
    } catch (error) {
      console.error('❌ Failed to load cart from storage:', error);
      setLastError('Gagal memuat keranjang');
      setStorageCorrupted(true);
    }
  }, []);

  // Repair cart storage
  const repairCartStorage = useCallback(async (): Promise<void> => {
    try {
      console.log('🛠️ Repairing cart storage...');
      
      // Reset cart data
      cartManager.clearCart();
      setCartItems([]);
      setIsNearQuota(false);
      
      // Clear corrupted cart data dari storage
      await AsyncStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
      
      setStorageCorrupted(false);
      setLastError(null);
      
      console.log('✅ Cart storage repaired successfully');
      
      Alert.alert(
        'Cart Repaired',
        'Corrupted cart data has been cleared. Your cart is now empty.'
      );
      
    } catch (error) {
      console.error('❌ Cart storage repair failed:', error);
      setLastError('Gagal memperbaiki data keranjang');
    }
  }, []);

  // Enhanced persistCart dengan corruption prevention
  const persistCart = useCallback(async (items: CartItem[]): Promise<void> => {
    try {
      const cleanedItems = items.length > CART_QUOTA_LIMIT ? 
        cartManager.autoCleanup() : items;

      // Validasi data sebelum disimpan
      const isValidCart = Array.isArray(cleanedItems) && cleanedItems.every(item => 
        item && typeof item.id === 'number' && typeof item.quantity === 'number'
      );
      
      if (!isValidCart) {
        throw new Error('INVALID_CART_DATA: Cart data structure is invalid');
      }

      const cartSize = JSON.stringify(cleanedItems).length;
      if (cartSize > 2 * 1024 * 1024) {
        throw new Error('QUOTA_EXCEEDED: Cart data too large');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(cleanedItems));
      setLastError(null);
      setIsNearQuota(cartManager.isNearQuotaLimit());
      setStorageCorrupted(false);
      
      console.log('💾 Cart persisted:', cleanedItems.length, 'items');

    } catch (error: any) {
      console.error('❌ Failed to persist cart:', error);
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        const errorMsg = 'Keranjang penuh. Beberapa item tidak dapat disimpan.';
        setLastError(errorMsg);
        
        if (items.length > CART_QUOTA_LIMIT) {
          const limitedItems = items.slice(0, CART_QUOTA_LIMIT);
          cartManager.setCartItems(limitedItems);
          setCartItems([...limitedItems]);
          await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(limitedItems));
          setLastError(`Keranjang dibatasi hingga ${CART_QUOTA_LIMIT} item.`);
        }
      } else if (error.message.includes('INVALID_CART_DATA')) {
        setStorageCorrupted(true);
        setLastError('Data keranjang tidak valid. Silakan coba lagi.');
      } else {
        setLastError('Gagal menyimpan keranjang. Coba lagi.');
      }
    }
  }, []);

  // Add to cart from deep link - FIXED MEMORY LEAK
  const addToCartFromDeepLink = useCallback(async (productId: number): Promise<void> => {
    if (!isMounted.current) {
      console.log('🛑 Component unmounted, skipping deep link processing');
      return;
    }
    
    setIsProcessingDeepLink(true);
    
    try {
      console.log(`🛒 Processing deep link add-to-cart for product: ${productId}`);
      
      if (!productService.isValidProductId(productId)) {
        throw new Error(`Product ID ${productId} tidak valid`);
      }
      
      const product = await productService.getProductById(productId);
      
      if (!product) {
        throw new Error(`Produk dengan ID ${productId} tidak ditemukan`);
      }
      
      await addToCart(product, 1);
      
      Alert.alert(
        'Berhasil',
        `"${product.title}" telah ditambahkan ke keranjang!`,
        [{ text: 'OK' }]
      );
      
      console.log(`✅ Product ${productId} added to cart via deep link`);
      
    } catch (error: any) {
      console.error('❌ Failed to add product from deep link:', error);
      
      Alert.alert(
        'Gagal',
        `Tidak dapat menambahkan produk: ${error.message}`,
        [{ text: 'OK' }]
      );
      
      setLastError(`Gagal menambahkan produk dari deep link: ${error.message}`);
    } finally {
      if (isMounted.current) {
        setIsProcessingDeepLink(false);
      }
    }
  }, []);

  const updateCartState = useCallback((items: CartItem[]) => {
    if (!isMounted.current) {
      console.log('🛑 Component unmounted, skipping state update');
      return;
    }
    setCartItems([...items]);
    setIsNearQuota(cartManager.isNearQuotaLimit());
  }, []);

  const addToCart = useCallback(async (product: any, quantity: number = 1): Promise<void> => {
    try {
      // Check jika storage corrupted
      if (storageCorrupted) {
        await repairCartStorage();
      }
      
      await cartManager.addToCart(product, quantity);
      const updatedItems = cartManager.getCartItems();
      updateCartState(updatedItems);
      await persistCart(updatedItems);
      
    } catch (error: any) {
      console.error('❌ Failed to add to cart:', error);
      if (error.message.includes('QUOTA_EXCEEDED')) {
        setLastError(`Maksimal ${CART_QUOTA_LIMIT} item dalam keranjang.`);
      }
      throw error;
    }
  }, [storageCorrupted, repairCartStorage, updateCartState, persistCart]);

  const removeFromCart = useCallback(async (productId: number): Promise<void> => {
    try {
      cartManager.removeFromCart(productId);
      const updatedItems = cartManager.getCartItems();
      updateCartState(updatedItems);
      await persistCart(updatedItems);
      
    } catch (error) {
      console.error('❌ Failed to remove from cart:', error);
      setLastError('Gagal menghapus item dari keranjang');
      throw error;
    }
  }, [updateCartState, persistCart]);

  const updateQuantity = useCallback(async (productId: number, quantity: number): Promise<void> => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      cartManager.updateQuantity(productId, quantity);
      const updatedItems = cartManager.getCartItems();
      updateCartState(updatedItems);
      await persistCart(updatedItems);
      
    } catch (error) {
      console.error('❌ Failed to update quantity:', error);
      setLastError('Gagal mengupdate jumlah item');
      throw error;
    }
  }, [removeFromCart, updateCartState, persistCart]);

  const clearCart = useCallback(async (): Promise<void> => {
    try {
      cartManager.clearCart();
      updateCartState([]);
      await AsyncStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
      setLastError(null);
      setIsNearQuota(false);
      setStorageCorrupted(false);
      
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      setLastError('Gagal mengosongkan keranjang');
      throw error;
    }
  }, [updateCartState]);

  const getTotalPrice = useCallback(() => cartManager.getTotalPrice(), []);
  const getTotalItems = useCallback(() => cartManager.getTotalItems(), []);

  // Load cart data on app start
  useEffect(() => {
    isMounted.current = true;
    initializeCart();
    
    return () => {
      isMounted.current = false;
      console.log('🧹 CartContext cleanup - unmounting');
    };
  }, [initializeCart]);

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    lastError,
    isNearQuota,
    // Deep link methods
    addToCartFromDeepLink,
    isProcessingDeepLink,
    // Storage corruption features
    storageCorrupted,
    initializeCart,
    repairCartStorage,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};