// src/context/WishlistContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { storageService } from '../services/storageService';

interface WishlistContextType {
  wishlistItems: number[];
  wishlistMeta: { count: number; updatedAt: string } | null;
  isLoading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [wishlistMeta, setWishlistMeta] = useState<{ count: number; updatedAt: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist data saat startup
  const loadWishlist = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading wishlist data...');
      
      const { items, meta } = await storageService.getWishlist();
      setWishlistItems(items);
      setWishlistMeta(meta);
      
      console.log(`✅ Wishlist loaded: ${items.length} items`);
    } catch (error) {
      console.error('❌ Error loading wishlist:', error);
      setWishlistItems([]);
      setWishlistMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: number): Promise<void> => {
    try {
      console.log(`❤️ Adding product ${productId} to wishlist`);
      
      const success = await storageService.addToWishlist(productId);
      if (success) {
        const updatedItems = [...wishlistItems, productId];
        const updatedMeta = {
          count: updatedItems.length,
          updatedAt: new Date().toISOString()
        };
        
        setWishlistItems(updatedItems);
        setWishlistMeta(updatedMeta);
        console.log(`✅ Product ${productId} added to wishlist`);
      }
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      throw error;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: number): Promise<void> => {
    try {
      console.log(`💔 Removing product ${productId} from wishlist`);
      
      const success = await storageService.removeFromWishlist(productId);
      if (success) {
        const updatedItems = wishlistItems.filter(id => id !== productId);
        const updatedMeta = {
          count: updatedItems.length,
          updatedAt: new Date().toISOString()
        };
        
        setWishlistItems(updatedItems);
        setWishlistMeta(updatedMeta);
        console.log(`✅ Product ${productId} removed from wishlist`);
      }
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      throw error;
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (productId: number): Promise<void> => {
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
      throw error;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.includes(productId);
  };

  // Clear entire wishlist
  const clearWishlist = async (): Promise<void> => {
    try {
      console.log('🧹 Clearing wishlist...');
      
      const success = await storageService.clearWishlist();
      if (success) {
        setWishlistItems([]);
        setWishlistMeta(null);
        console.log('✅ Wishlist cleared');
      }
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      throw error;
    }
  };

  // Get wishlist count
  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  // Load wishlist on component mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const contextValue: WishlistContextType = {
    wishlistItems,
    wishlistMeta,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};