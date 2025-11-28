// src/context/CartContext.tsx (FINAL VERSION)
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, cartManager } from '../utils/cart';
import { STORAGE_KEYS, CART_QUOTA_LIMIT } from '../constants/config';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isNearQuota, setIsNearQuota] = useState(false);

  // Load cart dari storage saat app start
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = async (): Promise<void> => {
    try {
      console.log('🔄 Loading cart from storage...');
      const storedCart = await AsyncStorage.getItem(STORAGE_KEYS.CART_ITEMS);
      
      if (storedCart) {
        const items: CartItem[] = JSON.parse(storedCart);
        cartManager.setCartItems(items);
        setCartItems([...items]);
        setIsNearQuota(cartManager.isNearQuotaLimit());
        console.log('✅ Cart loaded:', items.length, 'items');
      } else {
        console.log('ℹ️ No cart data found in storage');
      }
    } catch (error) {
      console.error('❌ Failed to load cart from storage:', error);
      setLastError('Gagal memuat keranjang');
    }
  };

  // PERSISTENSI CART DENGAN QUOTA HANDLING
  const persistCart = async (items: CartItem[]): Promise<void> => {
    try {
      // Auto-cleanup jika melebihi quota
      const cleanedItems = items.length > CART_QUOTA_LIMIT ? 
        cartManager.autoCleanup() : items;

      // Check storage size
      const cartSize = JSON.stringify(cleanedItems).length;
      if (cartSize > 2 * 1024 * 1024) { // 2MB limit
        throw new Error('QUOTA_EXCEEDED: Cart data too large');
      }

      // Gunakan setItem (lebih efisien daripada mergeItem untuk cart)
      await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(cleanedItems));
      setLastError(null);
      setIsNearQuota(cartManager.isNearQuotaLimit());
      
      console.log('💾 Cart persisted:', cleanedItems.length, 'items');

    } catch (error: any) {
      console.error('❌ Failed to persist cart:', error);
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        const errorMsg = 'Keranjang penuh. Beberapa item tidak dapat disimpan.';
        setLastError(errorMsg);
        
        // Auto-handle quota exceeded
        if (items.length > CART_QUOTA_LIMIT) {
          const limitedItems = items.slice(0, CART_QUOTA_LIMIT);
          cartManager.setCartItems(limitedItems);
          setCartItems([...limitedItems]);
          await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(limitedItems));
          setLastError(`Keranjang dibatasi hingga ${CART_QUOTA_LIMIT} item.`);
        }
      } else {
        setLastError('Gagal menyimpan keranjang. Coba lagi.');
      }
    }
  };

  const updateCartState = (items: CartItem[]) => {
    setCartItems([...items]);
    setIsNearQuota(cartManager.isNearQuotaLimit());
  };

  const addToCart = async (product: any, quantity: number = 1): Promise<void> => {
    try {
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
  };

  const removeFromCart = async (productId: number): Promise<void> => {
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
  };

  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
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
  };

  const clearCart = async (): Promise<void> => {
    try {
      cartManager.clearCart();
      updateCartState([]);
      await AsyncStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
      setLastError(null);
      setIsNearQuota(false);
      
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      setLastError('Gagal mengosongkan keranjang');
      throw error;
    }
  };

  const getTotalPrice = () => cartManager.getTotalPrice();
  const getTotalItems = () => cartManager.getTotalItems();

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      lastError,
      isNearQuota
    }}>
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