// src/services/cacheService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_CONFIG } from '../constants/config';

export interface CacheData<T> {
  value: T; // UBAH: dari 'data' menjadi 'value'
  ttl_product: number; // UBAH: tambah ttl_product field
  timestamp: number;
  ttl: number;
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

  // Set data dengan format baru { value, ttl_product, timestamp, ttl }
  async set<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        value: data, // UBAH: dari 'data' menjadi 'value'
        ttl_product: ttl, // TAMBAH: ttl_product field
        timestamp: Date.now(),
        ttl
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`💾 Cache saved: ${key}, TTL: ${ttl/60000}min`);
    } catch (error) {
      console.error('❌ Failed to save cache:', error);
    }
  }

  // Get data dengan pengecekan TTL - format baru
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
      const remainingTTL = Math.floor((cacheData.ttl - (now - cacheData.timestamp)) / 60000);
      console.log(`✅ Cache hit: ${key}, age: ${ageInMinutes}min, remaining: ${remainingTTL}min`);
      
      return cacheData.value; // UBAH: return cacheData.value
    } catch (error) {
      console.error('❌ Failed to get cache:', error);
      return null;
    }
  }

  // Remove cache
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Cache removed: ${key}`);
    } catch (error) {
      console.error('❌ Failed to remove cache:', error);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('cache_') || key.startsWith('@product_detail:')
      );
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🧹 Cleared ${cacheKeys.length} cache items`);
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  // TAMBAH: Method untuk mendapatkan semua keys dari AsyncStorage
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log(`🔑 Retrieved ${keys.length} keys from AsyncStorage`);
      return keys;
    } catch (error) {
      console.error('❌ Failed to get all keys from AsyncStorage:', error);
      return [];
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

  // === METHOD BARU: Get cache info (untuk debug) ===
  async getCacheInfo(key: string): Promise<{ 
    exists: boolean; 
    isExpired: boolean; 
    age: number; 
    remaining: number;
    data?: any;
  }> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) {
        return { exists: false, isExpired: false, age: 0, remaining: 0 };
      }

      const cacheData: CacheData<any> = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheData.timestamp;
      const isExpired = age > cacheData.ttl;
      const remaining = Math.max(0, cacheData.ttl - age);

      return {
        exists: true,
        isExpired,
        age: Math.floor(age / 60000), // dalam menit
        remaining: Math.floor(remaining / 60000), // dalam menit
        data: cacheData.value
      };
    } catch (error) {
      return { exists: false, isExpired: false, age: 0, remaining: 0 };
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();