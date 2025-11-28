// src/constants/config.ts
export const STORAGE_KEYS = {
  // Auth & User
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  
  // Cart
  CART_ITEMS: 'cart_items',
  
  // Preferences
  THEME_PREFERENCE: 'theme_preference',
  NOTIFICATION_SETTINGS: 'notification_settings',
  LANGUAGE_PREFERENCE: 'language_preference',
  
  // App State
  APP_FIRST_LAUNCH: 'app_first_launch',
  LAST_SYNC_TIMESTAMP: 'last_sync_timestamp',
};

export const CART_QUOTA_LIMIT = 50; // Maksimal item di keranjang
export const CACHE_TTL = 30 * 60 * 1000; // 30 menit

export const APP_CONFIG = {
  APP_NAME: 'E-Commerce App',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@ecommerce.com',
};