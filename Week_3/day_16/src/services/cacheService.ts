// src/services/cacheService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheData<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to Live in milliseconds
}

export class CacheService {
  private static instance: CacheService;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Set data dengan TTL
  async set<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`💾 Cache saved: ${key}, TTL: ${ttl/60000}min`);
    } catch (error) {
      console.error('❌ Failed to save cache:', error);
    }
  }

  // Get data dengan pengecekan TTL
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();
      const isExpired = (now - cacheData.timestamp) > cacheData.ttl;

      if (isExpired) {
        console.log(`⏰ Cache expired: ${key}`);
        await this.remove(key);
        return null;
      }

      const ageInMinutes = Math.floor((now - cacheData.timestamp) / 60000);
      console.log(`✅ Cache hit: ${key}, age: ${ageInMinutes}min`);
      return cacheData.data;
    } catch (error) {
      console.error('❌ Failed to get cache:', error);
      return null;
    }
  }

  // Remove cache
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('❌ Failed to remove cache:', error);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🧹 Cleared ${cacheKeys.length} cache items`);
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  // Check if cache is valid
  async isValid(key: string): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return false;

      const cacheData: CacheData<any> = JSON.parse(cached);
      return (Date.now() - cacheData.timestamp) <= cacheData.ttl;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();