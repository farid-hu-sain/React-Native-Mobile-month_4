// src/services/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export const storageService = {
  // Multi-key operations
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('❌ MultiGet failed:', error);
      return keys.map(key => [key, null]);
    }
  },

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('❌ MultiSet failed:', error);
      throw error;
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('❌ MultiRemove failed:', error);
      throw error;
    }
  },

  // Quota management
  async getStorageUsage(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const multiResult = await AsyncStorage.multiGet(keys);
      
      return multiResult.reduce((total, [_, value]) => {
        return total + (value ? value.length : 0);
      }, 0);
    } catch (error) {
      console.error('❌ Failed to get storage usage:', error);
      return 0;
    }
  },

  // Clear all app data (for logout)
  async clearAppData(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => 
        key.startsWith('auth_') || 
        key.startsWith('cache_') ||
        key.startsWith('user_') ||
        key === STORAGE_KEYS.CART_ITEMS
      );
      
      await AsyncStorage.multiRemove(appKeys);
      console.log(`🧹 Cleared ${appKeys.length} app data items`);
    } catch (error) {
      console.error('❌ Failed to clear app data:', error);
      throw error;
    }
  }
};