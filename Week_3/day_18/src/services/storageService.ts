// src/services/storageService.ts - FULL VERSION WITH CORRUPTION HANDLING
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { Alert } from 'react-native';

// === CONSTANTS ===
const EXPIRED_AT_KEY = 'token_expired_at';

// Types untuk corruption detection
interface StorageHealthCheck {
  totalItems: number;
  corruptedItems: number;
  repairedItems: number;
  errors: string[];
  timestamp: string;
}

interface RepairResult {
  success: boolean;
  repairedData?: any;
  error?: string;
}

class EnhancedStorageService {
  private corruptionDetected = false;
  private readonly STORAGE_VERSION = '1.0.0';

  // === CORRUPTION HANDLING METHODS ===

  // Validasi JSON
  private isValidJSON(str: string): boolean {
    if (str === null || str === undefined) return false;
    
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  // Safe JSON parsing dengan fallback - METHOD PUBLIC
  safeJSONParse<T>(data: string | null, fallback: T, key: string = 'unknown'): T {
    if (data === null || data === undefined) {
      console.log(`📭 No data found for key: ${key}`);
      return fallback;
    }

    try {
      return JSON.parse(data) as T;
    } catch (error: any) {
      console.error(`❌ JSON Parse Error for key "${key}":`, {
        dataLength: data?.length,
        firstChars: data?.substring(0, 50),
        error: error.message
      });
      
      this.logCorruption(key, data, error);
      return fallback;
    }
  }

  // Log corruption details
  private logCorruption(key: string, data: string, error: any): void {
    const corruptionInfo = {
      key,
      dataSample: data.substring(0, 100),
      dataLength: data.length,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    console.warn('🚨 Storage Corruption Detected:', corruptionInfo);
    this.saveCorruptionLog(corruptionInfo);
  }

  // Simpan corruption log
  private async saveCorruptionLog(corruptionInfo: any): Promise<void> {
    try {
      const existingLogs = await this.getCorruptionLogs();
      const updatedLogs = [...existingLogs, corruptionInfo].slice(-50);
      
      await AsyncStorage.setItem('corruption_logs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('❌ Failed to save corruption log:', error);
    }
  }

  // Ambil corruption logs
  private async getCorruptionLogs(): Promise<any[]> {
    try {
      const logs = await AsyncStorage.getItem('corruption_logs');
      return this.safeJSONParse(logs, [], 'corruption_logs');
    } catch (error) {
      return [];
    }
  }

  // Attempt repair corrupted data
  private async attemptRepair(key: string, corruptedData: string): Promise<RepairResult> {
    console.log(`🛠️ Attempting repair for key: ${key}`);
    
    try {
      let repairedData: any = null;
      
      // Repair strategy berdasarkan key type
      switch (key) {
        case STORAGE_KEYS.CART_ITEMS:
          repairedData = [];
          console.log('🛒 Repaired cart data: Reset to empty array');
          break;
          
        case STORAGE_KEYS.WISHLIST_ITEMS:
          repairedData = [];
          console.log('❤️ Repaired wishlist data: Reset to empty array');
          break;
          
        case STORAGE_KEYS.WISHLIST_META:
          repairedData = { count: 0, updatedAt: new Date().toISOString() };
          console.log('📊 Repaired wishlist meta: Reset to default');
          break;
          
        case STORAGE_KEYS.USER_DATA:
          repairedData = null;
          console.log('👤 Repaired user data: Reset to null');
          break;
          
        case STORAGE_KEYS.THEME_PREFERENCE:
          repairedData = 'light';
          console.log('🎨 Repaired theme preference: Reset to light');
          break;
          
        case STORAGE_KEYS.NOTIFICATION_SETTINGS:
          repairedData = 'true';
          console.log('🔔 Repaired notification settings: Reset to true');
          break;
          
        case STORAGE_KEYS.LANGUAGE_PREFERENCE:
          repairedData = 'id';
          console.log('🌐 Repaired language preference: Reset to id');
          break;
          
        case EXPIRED_AT_KEY:
          repairedData = null;
          console.log('⏰ Repaired expiredAt: Reset to null');
          break;
          
        default:
          repairedData = this.extractPartialData(corruptedData);
          console.log('🔧 Repaired unknown key with partial data extraction');
      }
      
      if (repairedData !== null) {
        await AsyncStorage.setItem(key, JSON.stringify(repairedData));
        return { success: true, repairedData };
      } else {
        await AsyncStorage.removeItem(key);
        return { success: true, repairedData: null };
      }
      
    } catch (repairError: any) {
      console.error(`❌ Repair failed for key ${key}:`, repairError);
      await AsyncStorage.removeItem(key);
      return { 
        success: false, 
        error: `Repair failed: ${repairError.message}` 
      };
    }
  }

  // Extract partial data dari corrupted string
  private extractPartialData(corruptedData: string): any {
    try {
      // Coba parse sebagai JSON biasa
      try {
        return JSON.parse(corruptedData);
      } catch (e) {}
      
      // Coba extract array pattern
      const arrayMatch = corruptedData.match(/\[[^\]]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (e) {}
      }
      
      // Coba extract object pattern  
      const objectMatch = corruptedData.match(/\{[^}]*\}/);
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0]);
        } catch (e) {}
      }
      
      // Fallback berdasarkan pattern
      if (corruptedData.includes('[') && corruptedData.includes(']')) {
        return [];
      }
      
      if (corruptedData.includes('{') && corruptedData.includes('}')) {
        return {};
      }
      
      return null;
    } catch (error) {
      console.error('❌ Partial data extraction failed:', error);
      return null;
    }
  }

  // === PUBLIC CORRUPTION HANDLING METHODS ===

  // Deteksi dan repair corrupted data
  async detectAndRepairCorruption(): Promise<StorageHealthCheck> {
    console.log('🔍 Starting storage corruption detection...');
    
    const healthCheck: StorageHealthCheck = {
      totalItems: 0,
      corruptedItems: 0,
      repairedItems: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const storageKeys = allKeys.filter(key => 
        key.startsWith('@') || 
        Object.values(STORAGE_KEYS).includes(key as any) ||
        key === EXPIRED_AT_KEY
      );

      healthCheck.totalItems = storageKeys.length;
      console.log(`📊 Checking ${healthCheck.totalItems} storage items...`);

      for (const key of storageKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          
          if (value === null) continue;

          if (!this.isValidJSON(value)) {
            console.warn(`⚠️ Corrupted data detected in key: ${key}`);
            healthCheck.corruptedItems++;
            
            const repairResult = await this.attemptRepair(key, value);
            if (repairResult.success) {
              healthCheck.repairedItems++;
              console.log(`✅ Repaired corrupted data for key: ${key}`);
            } else {
              healthCheck.errors.push(`Failed to repair: ${key}`);
              console.error(`❌ Failed to repair key: ${key}`);
            }
          }
        } catch (itemError: any) {
          healthCheck.errors.push(`Error checking ${key}: ${itemError.message}`);
          console.error(`❌ Error checking key ${key}:`, itemError);
        }
      }

      this.corruptionDetected = healthCheck.corruptedItems > 0;
      
      console.log('📋 Storage Health Check Completed:', {
        total: healthCheck.totalItems,
        corrupted: healthCheck.corruptedItems,
        repaired: healthCheck.repairedItems,
        errors: healthCheck.errors.length
      });

    } catch (error: any) {
      console.error('❌ Corruption detection failed:', error);
      healthCheck.errors.push(`Detection failed: ${error.message}`);
    }

    return healthCheck;
  }

  // Safe multiGet dengan corruption handling
  async safeMultiGet(keys: string[]): Promise<[string, any][]> {
    const results: [string, any][] = [];
    
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        const parsedValue = this.safeJSONParse(value, null, key);
        results.push([key, parsedValue]);
      } catch (error) {
        console.error(`❌ Error in safeMultiGet for key ${key}:`, error);
        results.push([key, null]);
      }
    }
    
    return results;
  }

  // Get storage health status
  async getStorageHealth(): Promise<{
    status: 'healthy' | 'corrupted' | 'unknown';
    totalItems: number;
    lastCheck: string | null;
    corruptionCount: number;
  }> {
    try {
      const corruptionLogs = await this.getCorruptionLogs();
      const lastCheck = corruptionLogs.length > 0 ? corruptionLogs[corruptionLogs.length - 1].timestamp : null;
      
      return {
        status: this.corruptionDetected ? 'corrupted' : 'healthy',
        totalItems: (await AsyncStorage.getAllKeys()).length,
        lastCheck,
        corruptionCount: corruptionLogs.length
      };
    } catch (error) {
      console.error('❌ Error getting storage health:', error);
      return {
        status: 'unknown',
        totalItems: 0,
        lastCheck: null,
        corruptionCount: 0
      };
    }
  }

  // Clear semua corrupted data
  async clearAllCorruptedData(): Promise<{ cleared: number }> {
    console.log('🧹 Clearing all corrupted data...');
    
    let clearedCount = 0;
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      for (const key of allKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value && !this.isValidJSON(value)) {
            await AsyncStorage.removeItem(key);
            clearedCount++;
            console.log(`🗑️ Cleared corrupted data: ${key}`);
          }
        } catch (error) {
          console.error(`❌ Error clearing key ${key}:`, error);
        }
      }
      
      console.log(`✅ Cleared ${clearedCount} corrupted items`);
      return { cleared: clearedCount };
    } catch (error) {
      console.error('❌ Failed to clear corrupted data:', error);
      return { cleared: 0 };
    }
  }

  // === EXISTING STORAGE METHODS - ENHANCED ===

  // Multi-key operations dengan safe handling
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('❌ MultiGet failed:', error);
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      // Validasi semua data sebelum disimpan
      for (const [key, value] of keyValuePairs) {
        if (!this.isValidJSON(value)) {
          throw new Error(`Invalid JSON data for key: ${key}`);
        }
      }
      
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('❌ MultiSet failed:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('❌ MultiRemove failed:', error);
      throw error;
    }
  }

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
  }

  // Clear all app data (for logout)
  async clearAppData(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => 
        key.startsWith('auth_') || 
        key.startsWith('cache_') ||
        key.startsWith('user_') ||
        Object.values(STORAGE_KEYS).includes(key as any) ||
        key === EXPIRED_AT_KEY
      );
      
      await AsyncStorage.multiRemove(appKeys);
      console.log(`🧹 Cleared ${appKeys.length} app data items`);
    } catch (error) {
      console.error('❌ Failed to clear app data:', error);
      throw error;
    }
  }

  // === WISHLIST MANAGEMENT - ENHANCED ===
  
  async saveWishlist(items: number[], meta?: { count: number; updatedAt: string }): Promise<boolean> {
    try {
      const wishlistMeta = meta || {
        count: items.length,
        updatedAt: new Date().toISOString()
      };

      // Validasi data sebelum disimpan
      if (!Array.isArray(items)) {
        throw new Error('Wishlist items must be an array');
      }

      await this.multiSet([
        [STORAGE_KEYS.WISHLIST_ITEMS, JSON.stringify(items)],
        [STORAGE_KEYS.WISHLIST_META, JSON.stringify(wishlistMeta)]
      ]);

      console.log(`✅ Wishlist saved: ${items.length} items, updated at ${wishlistMeta.updatedAt}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving wishlist:', error);
      return false;
    }
  }

  async getWishlist(): Promise<{
    items: number[];
    meta: { count: number; updatedAt: string } | null;
  }> {
    try {
      const [itemsResult, metaResult] = await this.safeMultiGet([
        STORAGE_KEYS.WISHLIST_ITEMS,
        STORAGE_KEYS.WISHLIST_META
      ]);

      const items = Array.isArray(itemsResult[1]) ? itemsResult[1] : [];
      const meta = metaResult[1] && typeof metaResult[1] === 'object' ? metaResult[1] : null;

      console.log(`✅ Wishlist loaded: ${items.length} items`);
      return { items, meta };
    } catch (error) {
      console.error('❌ Error loading wishlist:', error);
      return { items: [], meta: null };
    }
  }

  async clearWishlist(): Promise<boolean> {
    try {
      await this.multiRemove([
        STORAGE_KEYS.WISHLIST_ITEMS,
        STORAGE_KEYS.WISHLIST_META
      ]);
      console.log('✅ Wishlist cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      return false;
    }
  }

  async addToWishlist(productId: number): Promise<boolean> {
    try {
      const { items, meta } = await this.getWishlist();
      
      if (!items.includes(productId)) {
        const updatedItems = [...items, productId];
        const updatedMeta = {
          count: updatedItems.length,
          updatedAt: new Date().toISOString()
        };
        
        return await this.saveWishlist(updatedItems, updatedMeta);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      return false;
    }
  }

  async removeFromWishlist(productId: number): Promise<boolean> {
    try {
      const { items } = await this.getWishlist();
      const updatedItems = items.filter(id => id !== productId);
      const updatedMeta = {
        count: updatedItems.length,
        updatedAt: new Date().toISOString()
      };
      
      return await this.saveWishlist(updatedItems, updatedMeta);
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      return false;
    }
  }

  async isInWishlist(productId: number): Promise<boolean> {
    try {
      const { items } = await this.getWishlist();
      return items.includes(productId);
    } catch (error) {
      console.error('❌ Error checking wishlist:', error);
      return false;
    }
  }

  // === TOKEN EXPIRED MANAGEMENT - ENHANCED ===
  
  async saveTokenExpiredAt(): Promise<boolean> {
    try {
      const expiredAt = new Date();
      expiredAt.setHours(expiredAt.getHours() + 24);
      
      await AsyncStorage.setItem(EXPIRED_AT_KEY, expiredAt.toISOString());
      console.log(`✅ Token expiredAt saved: ${expiredAt.toISOString()}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving expiredAt:', error);
      return false;
    }
  }

  async getTokenExpiredAt(): Promise<Date | null> {
    try {
      const expiredAtString = await AsyncStorage.getItem(EXPIRED_AT_KEY);
      if (expiredAtString) {
        const expiredAt = this.safeJSONParse(`"${expiredAtString}"`, null, EXPIRED_AT_KEY);
        if (expiredAt) {
          console.log(`✅ Token expiredAt retrieved: ${expiredAt}`);
          return new Date(expiredAt);
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting expiredAt:', error);
      return null;
    }
  }

  async deleteTokenExpiredAt(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(EXPIRED_AT_KEY);
      console.log('✅ Token expiredAt deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting expiredAt:', error);
      return false;
    }
  }

  async isTokenExpired(): Promise<boolean> {
    try {
      const expiredAt = await this.getTokenExpiredAt();
      if (!expiredAt) return true;

      const now = new Date();
      const isExpired = now >= expiredAt;
      
      if (isExpired) {
        console.log('❌ Token has expired');
      } else {
        console.log(`✅ Token valid, expires in: ${Math.round((expiredAt.getTime() - now.getTime()) / 1000 / 60)} minutes`);
      }
      
      return isExpired;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return true;
    }
  }

  async getTokenRemainingTime(): Promise<number> {
    try {
      const expiredAt = await this.getTokenExpiredAt();
      if (!expiredAt) return 0;
      
      const now = new Date();
      const remaining = expiredAt.getTime() - now.getTime();
      
      return Math.max(0, remaining);
    } catch (error) {
      console.error('❌ Error getting token remaining time:', error);
      return 0;
    }
  }
}

// Export instance
export const storageService = new EnhancedStorageService();
export default storageService;