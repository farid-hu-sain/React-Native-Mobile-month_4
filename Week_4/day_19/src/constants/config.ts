// src/constants/config.ts - ENHANCED VERSION
export const STORAGE_KEYS = {
  CART_ITEMS: 'cart_items',
  USER_DATA: 'user_data',
  THEME_PREFERENCE: 'theme_preference',
  NOTIFICATION_SETTINGS: 'notification_settings',
  LANGUAGE_PREFERENCE: 'language_preference',
  WISHLIST_ITEMS: 'wishlist_items',
  WISHLIST_META: 'wishlist_meta',
} as const;

// NEW: Storage corruption configuration
export const STORAGE_CONFIG = {
  MAX_ITEM_SIZE: 2 * 1024 * 1024, // 2MB per item
  TOTAL_QUOTA: 10 * 1024 * 1024, // 10MB total
  CORRUPTION_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  AUTO_REPAIR: true,
} as const;

// === CACHE CONFIGURATION ===
export const CACHE_CONFIG = {
  PRODUCT_DETAIL: {
    TTL: 15 * 60 * 1000, // 15 menit dalam milliseconds
    KEY_PREFIX: '@product_detail:'
  },
  PRODUCT_LIST: {
    TTL: 10 * 60 * 1000, // 10 menit
  },
  CATEGORIES: {
    TTL: 60 * 60 * 1000, // 1 jam
  }
} as const;

// === RETRY CONFIGURATION ===
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 detik
  MAX_DELAY: 10000, // 10 detik
  BACKOFF_MULTIPLIER: 2,
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  RETRYABLE_ERROR_CODES: ['NETWORK_ERROR', 'TIMEOUT', 'ECONNABORTED']
} as const;

// NEW: Cart quota limit
export const CART_QUOTA_LIMIT = 50;

export const APP_CONFIG = {
  name: 'E-Commerce App',
  version: '1.0.0',
  api: {
    baseURL: 'https://dummyjson.com',
    timeout: 10000,
  },
  features: {
    enableDarkMode: true,
    enableOffline: true,
    enableWishlist: true,
    enableProductCache: true,
    enableRetryLogic: true,
    // NEW: Storage corruption handling
    enableStorageHealthCheck: true,
    enableAutoRepair: true,
    enableCorruptionLogging: true,
  }
};