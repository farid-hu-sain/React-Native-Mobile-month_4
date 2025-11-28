// src/utils/storageCorruptionSimulator.ts - NEW FILE
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export class StorageCorruptionSimulator {
  // Simulasi berbagai jenis corrupted data
  static async simulateCorruptedCart(): Promise<void> {
    const corruptedData = '{"invalid": json, data]';
    await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, corruptedData);
    console.log('🧪 Simulated corrupted cart data');
  }

  static async simulateCorruptedWishlist(): Promise<void> {
    const corruptedData = '[1,2,3,invalid,5]';
    await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_ITEMS, corruptedData);
    console.log('🧪 Simulated corrupted wishlist data');
  }

  static async simulateCorruptedUserData(): Promise<void> {
    const corruptedData = '{"user": "invalid" json}';
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, corruptedData);
    console.log('🧪 Simulated corrupted user data');
  }

  static async simulateCorruptedTheme(): Promise<void> {
    const corruptedData = 'invalid-json-theme';
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, corruptedData);
    console.log('🧪 Simulated corrupted theme preference');
  }

  static async simulatePartialCorruption(): Promise<void> {
    // Data yang hampir valid tapi ada error kecil
    const partialData = '{"items": [1,2,3], "count": 3,}'; // Extra comma
    await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_ITEMS, partialData);
    console.log('🧪 Simulated partial corruption');
  }

  static async simulateAllCorruptions(): Promise<void> {
    await Promise.all([
      this.simulateCorruptedCart(),
      this.simulateCorruptedWishlist(),
      this.simulateCorruptedUserData(),
      this.simulateCorruptedTheme(),
    ]);
    console.log('🧪 Simulated all types of corruption');
  }

  // Clear semua simulasi corrupted data
  static async clearSimulations(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CART_ITEMS,
      STORAGE_KEYS.WISHLIST_ITEMS,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.THEME_PREFERENCE,
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      STORAGE_KEYS.LANGUAGE_PREFERENCE,
    ]);
    console.log('🧹 Cleared all corruption simulations');
  }

  // Check jika ada data corrupted
  static async hasCorruptedData(): Promise<boolean> {
    try {
      const [cart, wishlist, user, theme] = await AsyncStorage.multiGet([
        STORAGE_KEYS.CART_ITEMS,
        STORAGE_KEYS.WISHLIST_ITEMS,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.THEME_PREFERENCE,
      ]);

      const isCorrupted = (data: string | null) => {
        if (!data) return false;
        try {
          JSON.parse(data);
          return false;
        } catch {
          return true;
        }
      };

      return isCorrupted(cart[1]) || isCorrupted(wishlist[1]) || 
             isCorrupted(user[1]) || isCorrupted(theme[1]);
    } catch (error) {
      console.error('Error checking corruption:', error);
      return false;
    }
  }

  // Get corruption report
  static async getCorruptionReport(): Promise<{
    totalItems: number;
    corruptedItems: number;
    corruptedKeys: string[];
  }> {
    try {
      const keys = [
        STORAGE_KEYS.CART_ITEMS,
        STORAGE_KEYS.WISHLIST_ITEMS,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.THEME_PREFERENCE,
        STORAGE_KEYS.NOTIFICATION_SETTINGS,
        STORAGE_KEYS.LANGUAGE_PREFERENCE,
      ];

      const results = await AsyncStorage.multiGet(keys);
      
      const corruptedKeys: string[] = [];
      
      results.forEach(([key, value]) => {
        if (value) {
          try {
            JSON.parse(value);
          } catch {
            corruptedKeys.push(key);
          }
        }
      });

      return {
        totalItems: keys.length,
        corruptedItems: corruptedKeys.length,
        corruptedKeys
      };
    } catch (error) {
      console.error('Error getting corruption report:', error);
      return {
        totalItems: 0,
        corruptedItems: 0,
        corruptedKeys: []
      };
    }
  }
}