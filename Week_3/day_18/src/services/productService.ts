// src/services/productService.ts (CONSISTENT CACHE STRATEGY)
import apiClient, { retryWithBackoff } from './apiClient';
import { cacheService } from './cacheService';
import { CACHE_CONFIG, RETRY_CONFIG } from '../constants/config';

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  category?: string;
  images?: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// CONSISTENT Cache keys dengan format yang sama
const CACHE_KEYS = {
  ALL_PRODUCTS: (limit: number, skip: number) => `@products_list:${limit}:${skip}`,
  PRODUCT_BY_ID: (id: number) => `@product_detail:${id}`,
  PRODUCTS_BY_CATEGORY: (category: string) => `@products_category:${category}`,
  SEARCH_PRODUCTS: (query: string) => `@products_search:${query}`,
  CATEGORIES_LIST: '@categories_list',
};

// Validasi product ID untuk DummyJSON (hanya 1-100)
const isValidProductId = (id: number): boolean => {
  return id >= 1 && id <= 100;
};

// Fallback product data untuk ID yang tidak valid
const createFallbackProduct = (id: number): Product => ({
  id: id,
  title: `Produk #${id} - Tidak Tersedia`,
  price: 0,
  image: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Produk+Tidak+Tersedia",
  description: "Maaf, produk ini sedang tidak tersedia. Silakan coba produk lainnya.",
  category: "Unknown",
  rating: 0,
  stock: 0
});

// API operation functions untuk retry logic
const apiOperations = {
  getProduct: (id: number) => apiClient.get(`/products/${id}`),
  getProducts: (limit: number, skip: number) => apiClient.get(`/products?limit=${limit}&skip=${skip}`),
  getProductsByCategory: (category: string) => apiClient.get(`/products/category/${category}`),
  searchProducts: (query: string) => apiClient.get(`/products/search?q=${query}`),
  getCategories: () => apiClient.get('/products/categories'),
};

export const productService = {
  // Get single product by ID dengan cache + retry logic
  async getProductById(id: number, useCache: boolean = true): Promise<Product> {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);
    
    // Validasi product ID terlebih dahulu
    if (!isValidProductId(id)) {
      console.log(`⚠️ Invalid product ID: ${id}. Using fallback data.`);
      return createFallbackProduct(id);
    }
    
    try {
      // Try to get from cache first jika useCache = true
      if (useCache) {
        const cachedData = await cacheService.get<Product>(cacheKey);
        if (cachedData) {
          console.log(`📦 Using cached product: ${id}`);
          
          // Debug cache info
          const cacheInfo = await cacheService.getCacheInfo(cacheKey);
          console.log(`ℹ️ Cache info - Age: ${cacheInfo.age}min, Remaining: ${cacheInfo.remaining}min`);
          
          return cachedData;
        }
      }

      // Jika no cache atau cache disabled, fetch from API dengan retry logic
      console.log(`🌐 Fetching product ${id} from API...`);
      
      const response = await retryWithBackoff(
        () => apiOperations.getProduct(id),
        RETRY_CONFIG.MAX_RETRIES,
        RETRY_CONFIG.BASE_DELAY,
        RETRY_CONFIG.MAX_DELAY
      );
      
      // Validasi response
      if (!response.data || response.data.id !== id) {
        throw new Error(`Invalid product data received for ID: ${id}`);
      }
      
      const product = response.data;

      // Cache the product dengan TTL khusus product detail
      await cacheService.set(
        cacheKey, 
        product, 
        CACHE_CONFIG.PRODUCT_DETAIL.TTL
      );
      
      console.log(`✅ Product ${id} cached with TTL: ${CACHE_CONFIG.PRODUCT_DETAIL.TTL/60000}min`);
      return product;

    } catch (error: any) {
      console.error(`❌ Error fetching product ${id} after ${RETRY_CONFIG.MAX_RETRIES + 1} attempts:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        isNetworkError: error.isNetworkError,
        isTimeout: error.isTimeout
      });
      
      // Fallback to cache bahkan jika expired
      const cachedData = await cacheService.get<Product>(cacheKey);
      if (cachedData) {
        console.log(`🔄 Using expired cache as fallback for product: ${id}`);
        return cachedData;
      }
      
      // Jika tidak ada cache, throw error untuk ditangani ErrorBoundary
      console.log(`📋 No cache available, throwing error for ErrorBoundary: ${id}`);
      throw new Error(`Gagal memuat produk ${id} setelah ${RETRY_CONFIG.MAX_RETRIES + 1} percobaan. Periksa koneksi internet Anda.`);
    }
  },

  // Get all products with cache-first strategy + retry logic
  async getProducts(limit: number = 20, skip: number = 0): Promise<ProductsResponse> {
    const cacheKey = CACHE_KEYS.ALL_PRODUCTS(limit, skip);
    
    try {
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log('📦 Using cached products');
        return cachedData;
      }

      console.log('🌐 Fetching products from API...');
      
      const response = await retryWithBackoff(
        () => apiOperations.getProducts(limit, skip),
        RETRY_CONFIG.MAX_RETRIES,
        RETRY_CONFIG.BASE_DELAY,
        RETRY_CONFIG.MAX_DELAY
      );
      
      const apiData = response.data;

      // Validasi response
      if (!apiData.products || !Array.isArray(apiData.products)) {
        throw new Error('Invalid products data received');
      }

      await cacheService.set(cacheKey, apiData, CACHE_CONFIG.PRODUCT_LIST.TTL);
      
      console.log(`✅ Loaded ${apiData.products.length} products from API`);
      return apiData;

    } catch (error: any) {
      console.error('❌ Error in getProducts after retries:', error);
      
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log('🔄 Using expired cache as fallback');
        return cachedData;
      }
      
      // Throw error untuk ErrorBoundary
      throw new Error(`Gagal memuat daftar produk setelah ${RETRY_CONFIG.MAX_RETRIES + 1} percobaan. Periksa koneksi internet Anda.`);
    }
  },

  // Get products by category with cache-first strategy + retry logic
  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    const cacheKey = CACHE_KEYS.PRODUCTS_BY_CATEGORY(category);
    
    try {
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`📦 Using cached products for category: ${category}`);
        return cachedData;
      }

      console.log(`🌐 Fetching products for category: ${category}...`);
      
      const response = await retryWithBackoff(
        () => apiOperations.getProductsByCategory(category),
        RETRY_CONFIG.MAX_RETRIES,
        RETRY_CONFIG.BASE_DELAY,
        RETRY_CONFIG.MAX_DELAY
      );
      
      const apiData = response.data;

      await cacheService.set(cacheKey, apiData, CACHE_CONFIG.PRODUCT_LIST.TTL);
      
      console.log(`✅ Loaded ${apiData.products.length} products for category: ${category}`);
      return apiData;

    } catch (error: any) {
      console.error(`❌ Error fetching products for category ${category} after retries:`, error);
      
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`🔄 Using expired cache as fallback for category: ${category}`);
        return cachedData;
      }
      
      throw new Error(`Gagal memuat produk kategori ${category} setelah ${RETRY_CONFIG.MAX_RETRIES + 1} percobaan.`);
    }
  },

  // Search products with cache + retry logic
  async searchProducts(query: string): Promise<ProductsResponse> {
    const cacheKey = CACHE_KEYS.SEARCH_PRODUCTS(query);
    
    try {
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`📦 Using cached search results for: ${query}`);
        return cachedData;
      }

      console.log(`🌐 Searching products with query: ${query}...`);
      
      const response = await retryWithBackoff(
        () => apiOperations.searchProducts(query),
        RETRY_CONFIG.MAX_RETRIES,
        RETRY_CONFIG.BASE_DELAY,
        RETRY_CONFIG.MAX_DELAY
      );
      
      const apiData = response.data;

      await cacheService.set(cacheKey, apiData, CACHE_CONFIG.PRODUCT_LIST.TTL);
      
      return apiData;

    } catch (error: any) {
      console.error(`❌ Error searching products with query ${query} after retries:`, error);
      
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`🔄 Using expired cache as fallback for search: ${query}`);
        return cachedData;
      }
      
      throw new Error(`Gagal mencari produk "${query}" setelah ${RETRY_CONFIG.MAX_RETRIES + 1} percobaan.`);
    }
  },

  // Get all categories with cache + retry logic
  async getCategories(): Promise<string[]> {
    const cacheKey = CACHE_KEYS.CATEGORIES_LIST;
    
    try {
      const cachedData = await cacheService.get<string[]>(cacheKey);
      if (cachedData) {
        console.log('📦 Using cached categories');
        return cachedData;
      }

      console.log('🌐 Fetching categories from API...');
      
      const response = await retryWithBackoff(
        () => apiOperations.getCategories(),
        RETRY_CONFIG.MAX_RETRIES,
        RETRY_CONFIG.BASE_DELAY,
        RETRY_CONFIG.MAX_DELAY
      );
      
      const categories = response.data;

      await cacheService.set(cacheKey, categories, CACHE_CONFIG.CATEGORIES.TTL);
      
      console.log(`✅ Loaded ${categories.length} categories from API`);
      return categories;

    } catch (error: any) {
      console.error('❌ Error fetching categories after retries:', error);
      
      const cachedData = await cacheService.get<string[]>(cacheKey);
      if (cachedData) {
        console.log('🔄 Using expired cache as fallback for categories');
        return cachedData;
      }
      
      throw new Error(`Gagal memuat kategori setelah ${RETRY_CONFIG.MAX_RETRIES + 1} percobaan.`);
    }
  },

  // Clear all product cache (utility function)
  async clearCache(): Promise<void> {
    console.log('🧹 Clearing all product cache...');
    await cacheService.clear();
  },

  // Enhanced preload cache untuk startup optimization
  async preloadCache(): Promise<void> {
    try {
      console.log('🚀 Preloading cache for better startup experience...');
      
      // Jalankan semua preload tasks secara paralel
      await Promise.allSettled([
        // Preload main products (non-blocking)
        this.getProducts(20, 0).catch(error => 
          console.error('❌ Products preload failed:', error)
        ),
        
        // Preload categories (non-blocking)
        this.getCategories().catch(error => 
          console.error('❌ Categories preload failed:', error)
        ),
        
        // Preload popular products (non-blocking)
        this.getProductsByCategory('smartphones').catch(error => 
          console.error('❌ Smartphones preload failed:', error)
        ),
      ]);
      
      console.log('✅ Cache preloaded successfully');

    } catch (error) {
      console.error('❌ Cache preloading failed:', error);
      // Tidak throw error karena preload adalah optimization, bukan requirement
    }
  },

  // Force refresh product (ignore cache)
  async refreshProduct(id: number): Promise<Product> {
    console.log(`🔄 Force refreshing product: ${id}`);
    
    // Validasi product ID terlebih dahulu
    if (!isValidProductId(id)) {
      console.log(`⚠️ Invalid product ID for refresh: ${id}. Using fallback data.`);
      return createFallbackProduct(id);
    }
    
    return this.getProductById(id, false); // force API call
  },

  // Get cache status untuk product
  async getProductCacheStatus(id: number): Promise<{
    exists: boolean;
    isExpired: boolean;
    age: number;
    remaining: number;
  }> {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);
    return cacheService.getCacheInfo(cacheKey);
  },

  // Clear specific product cache
  async clearProductCache(id: number): Promise<void> {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);
    await cacheService.remove(cacheKey);
    console.log(`🗑️ Cleared cache for product: ${id}`);
  },

  // Validasi product ID
  isValidProductId: isValidProductId,

  // Method untuk check cache health
  async getCacheHealth(): Promise<{
    totalCachedItems: number;
    expiredItems: number;
    totalSize: number;
  }> {
    try {
      const keys = await cacheService.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('@products_') || 
        key.startsWith('@product_detail:') ||
        key.startsWith('@categories')
      );
      
      let expiredItems = 0;
      
      for (const key of cacheKeys) {
        const isValid = await cacheService.isValid(key);
        if (!isValid) {
          expiredItems++;
        }
      } 
      
      return {
        totalCachedItems: cacheKeys.length,
        expiredItems,
        totalSize: cacheKeys.length // Simplified size calculation
      };
    } catch (error) {
      console.error('❌ Error checking cache health:', error);
      return {
        totalCachedItems: 0,
        expiredItems: 0,
        totalSize: 0
      };
    }
  }
};