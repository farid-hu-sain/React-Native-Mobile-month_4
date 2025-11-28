// src/hooks/useWishlist.ts
import { useWishlist } from '../context/WishlistContext';

// Re-export dari context untuk kemudahan penggunaan
export { useWishlist };

// Custom hook tambahan untuk wishlist operations
export const useWishlistOperations = () => {
  const { 
    wishlistItems, 
    wishlistMeta, 
    toggleWishlist, 
    isInWishlist,
    getWishlistCount 
  } = useWishlist();

  const getWishlistStatus = (productId: number) => {
    return {
      isInWishlist: isInWishlist(productId),
      wishlistCount: getWishlistCount(),
      lastUpdated: wishlistMeta?.updatedAt || null
    };
  };

  const getWishlistStats = () => {
    return {
      totalItems: getWishlistCount(),
      lastUpdated: wishlistMeta?.updatedAt ? new Date(wishlistMeta.updatedAt) : null,
      isEmpty: wishlistItems.length === 0
    };
  };

  return {
    wishlistItems,
    wishlistMeta,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    getWishlistStatus,
    getWishlistStats
  };
};