// src/services/productService.ts (UPDATED)
import apiClient from './apiClient';
import { cacheService } from './cacheService';

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

// Cache keys
const CACHE_KEYS = {
  ALL_PRODUCTS: (limit: number, skip: number) => `cache_products_${limit}_${skip}`,
  PRODUCT_BY_ID: (id: number) => `cache_product_${id}`,
  PRODUCTS_BY_CATEGORY: (category: string) => `cache_category_${category}`,
  SEARCH_PRODUCTS: (query: string) => `cache_search_${query}`,
  CATEGORIES_LIST: 'cache_categories_list',
};

// TTL configuration (30 minutes in milliseconds)
const TTL = 30 * 60 * 1000;

export const productService = {
  // Get all products with cache-first strategy
  async getProducts(limit: number = 20, skip: number = 0): Promise<ProductsResponse> {
    const cacheKey = CACHE_KEYS.ALL_PRODUCTS(limit, skip);
    
    try {
      // Try to get from cache first
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log('📦 Using cached products');
        return cachedData;
      }

      // If no cache or expired, fetch from API
      console.log('🌐 Fetching products from API...');
      const response = await apiClient.get(`/products?limit=${limit}&skip=${skip}`);
      const apiData = response.data;

      // Cache the fresh data
      await cacheService.set(cacheKey, apiData, TTL);
      
      console.log(`✅ Loaded ${apiData.products.length} products from API`);
      return apiData;

    } catch (error: any) {
      console.error('❌ Error in getProducts:', error);
      
      // Fallback to any available cache even if expired
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log('🔄 Using expired cache as fallback');
        return cachedData;
      }
      
      throw error;
    }
  },

  // Get single product by ID with cache
  async getProductById(id: number): Promise<Product> {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);
    
    try {
      // Try to get from cache first
      const cachedData = await cacheService.get<Product>(cacheKey);
      if (cachedData) {
        console.log(`📦 Using cached product: ${id}`);
        return cachedData;
      }

      // If no cache, fetch from API
      console.log(`🌐 Fetching product ${id} from API...`);
      const response = await apiClient.get(`/products/${id}`);
      const product = response.data;

      // Cache the product
      await cacheService.set(cacheKey, product, TTL);
      
      return product;

    } catch (error: any) {
      console.error(`❌ Error fetching product ${id}:`, error);
      
      // Fallback to cache
      const cachedData = await cacheService.get<Product>(cacheKey);
      if (cachedData) {
        console.log(`🔄 Using expired cache as fallback for product: ${id}`);
        return cachedData;
      }
      
      throw error;
    }
  },

  // Get products by category with cache-first strategy
  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    const cacheKey = CACHE_KEYS.PRODUCTS_BY_CATEGORY(category);
    
    try {
      // Try to get from cache first
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`📦 Using cached products for category: ${category}`);
        return cachedData;
      }

      // If no cache, fetch from API
      console.log(`🌐 Fetching products for category: ${category}...`);
      const response = await apiClient.get(`/products/category/${category}`);
      const apiData = response.data;

      // Cache the data
      await cacheService.set(cacheKey, apiData, TTL);
      
      console.log(`✅ Loaded ${apiData.products.length} products for category: ${category}`);
      return apiData;

    } catch (error: any) {
      console.error(`❌ Error fetching products for category ${category}:`, error);
      
      // Fallback to cache
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`🔄 Using expired cache as fallback for category: ${category}`);
        return cachedData;
      }
      
      throw error;
    }
  },

  // Search products with cache
  async searchProducts(query: string): Promise<ProductsResponse> {
    const cacheKey = CACHE_KEYS.SEARCH_PRODUCTS(query);
    
    try {
      // Try to get from cache first
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`📦 Using cached search results for: ${query}`);
        return cachedData;
      }

      // If no cache, fetch from API
      console.log(`🌐 Searching products with query: ${query}...`);
      const response = await apiClient.get(`/products/search?q=${query}`);
      const apiData = response.data;

      // Cache the search results
      await cacheService.set(cacheKey, apiData, TTL);
      
      return apiData;

    } catch (error: any) {
      console.error(`❌ Error searching products with query ${query}:`, error);
      
      // Fallback to cache
      const cachedData = await cacheService.get<ProductsResponse>(cacheKey);
      if (cachedData) {
        console.log(`🔄 Using expired cache as fallback for search: ${query}`);
        return cachedData;
      }
      
      throw error;
    }
  },

  // Get all categories with cache
  async getCategories(): Promise<string[]> {
    const cacheKey = CACHE_KEYS.CATEGORIES_LIST;
    
    try {
      // Try to get from cache first
      const cachedData = await cacheService.get<string[]>(cacheKey);
      if (cachedData) {
        console.log('📦 Using cached categories');
        return cachedData;
      }

      // If no cache, fetch from API
      console.log('🌐 Fetching categories from API...');
      const response = await apiClient.get('/products/categories');
      const categories = response.data;

      // Cache the categories (longer TTL since categories don't change often)
      await cacheService.set(cacheKey, categories, TTL * 2); // 1 hour
      
      console.log(`✅ Loaded ${categories.length} categories from API`);
      return categories;

    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      
      // Fallback to cache
      const cachedData = await cacheService.get<string[]>(cacheKey);
      if (cachedData) {
        console.log('🔄 Using expired cache as fallback for categories');
        return cachedData;
      }
      
      throw error;
    }
  },

  // Clear all product cache (utility function)
  async clearCache(): Promise<void> {
    console.log('🧹 Clearing all product cache...');
    await cacheService.clear();
  },

  // Preload cache for better offline experience
  async preloadCache(): Promise<void> {
    try {
      console.log('🚀 Preloading cache...');
      
      // Preload main products
      await this.getProducts(20, 0);
      
      // Preload categories
      await this.getCategories();
      
      console.log('✅ Cache preloaded successfully');
    } catch (error) {
      console.error('❌ Cache preloading failed:', error);
    }
  }
};