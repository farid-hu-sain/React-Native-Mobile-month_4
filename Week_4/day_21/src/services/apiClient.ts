// src/services/apiClient.ts (UPDATED WITH RETRY LOGIC)
import axios from 'axios';
import { authHelper } from './authHelper';
import NetInfo from '@react-native-community/netinfo';
import { keychainService, KEYCHAIN_SERVICES } from './keychainService';
import { RETRY_CONFIG } from '../constants/config';

// Utility function untuk exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function untuk menentukan apakah request harus di-retry
const shouldRetry = (error: any): boolean => {
  // Cek error code
  if (RETRY_CONFIG.RETRYABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }
  
  // Cek status code
  if (error.response && RETRY_CONFIG.RETRYABLE_STATUS_CODES.includes(error.response.status)) {
    return true;
  }
  
  // Cek network error
  if (!error.response && error.request) {
    return true;
  }
  
  // Cek custom network error dari interceptor
  if (error.isInternetReachable === false) {
    return true;
  }
  
  return false;
};

// Exponential backoff retry function
export const retryWithBackoff = async (
  operation: () => Promise<any>,
  maxRetries: number = RETRY_CONFIG.MAX_RETRIES,
  baseDelay: number = RETRY_CONFIG.BASE_DELAY,
  maxDelay: number = RETRY_CONFIG.MAX_DELAY
): Promise<any> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
      }
      return await operation();
      
    } catch (error: any) {
      lastError = error;
      
      // Jika bukan retryable error atau sudah mencapai max retries, throw error
      if (!shouldRetry(error) || attempt === maxRetries) {
        console.log(`❌ Final attempt failed after ${attempt + 1} attempts`);
        throw error;
      }
      
      // Calculate delay dengan exponential backoff
      const delayMs = Math.min(
        baseDelay * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt),
        maxDelay
      );
      
      console.log(`⏳ Retry ${attempt + 1} failed, waiting ${delayMs}ms before next attempt`);
      console.log(`📋 Error: ${error.message}`);
      
      // Tunggu sebelum retry
      await delay(delayMs);
    }
  }
  
  throw lastError;
};

const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let validationErrors: { [key: string]: string } = {};

// 5. SIMPAN API KEY SECRET KE KEYCHAIN (jalankan sekali)
export const initializeApiKey = async (): Promise<void> => {
  try {
    const existingKey = await keychainService.getApiKey();
    if (!existingKey) {
      // Simpan API key rahasia (dalam real app, ini bisa dari environment variables)
      const secretApiKey = 'API_KEY_SECRET_XYZ_12345';
      await keychainService.saveApiKey(secretApiKey);
      console.log('✅ API Key saved to Keychain');
    }
  } catch (error) {
    console.error('❌ Failed to initialize API Key:', error);
  }
};

// Updated interceptor dengan secure API Key
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isInternetReachable) {
        console.log('🚫 Blocking API request - No internet connection');
        return Promise.reject({
          message: 'No internet connection',
          code: 'NETWORK_ERROR',
          isInternetReachable: false
        });
      }
      
      config.headers['X-Client-Platform'] = 'React-Native';
      
      // 5. AMBIL API KEY DARI KEYCHAIN UNTUK SETIAP REQUEST
      try {
        const apiKey = await keychainService.getApiKey();
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        } else {
          console.warn('⚠️ API Key not found in Keychain');
          // Simulate 401 Unauthorized jika API key tidak ditemukan
          return Promise.reject({
            message: 'Unauthorized - API Key missing',
            status: 401
          });
        }
      } catch (keychainError: any) {
        console.error('❌ Keychain API Key error:', keychainError);
        return Promise.reject({
          message: 'Unauthorized - Secure storage error',
          status: 401
        });
      }
      
      // Token authentication (existing)
      const token = authHelper.getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Existing response interceptor tetap sama
apiClient.interceptors.response.use(
  (response) => {
    validationErrors = {};
    return response;
  },
  (error) => {
    if (error.response?.status === 400) {
      console.log('🔍 HTTP 400 - Validation error detected');
      
      const errorData = error.response.data;
      
      if (errorData.errors && typeof errorData.errors === 'object') {
        validationErrors = errorData.errors;
        console.log('📋 Validation errors:', validationErrors);
        
        return Promise.reject({
          type: 'VALIDATION_ERROR',
          errors: validationErrors,
          message: 'Validation failed',
          status: 400
        });
      }
    }
    
    if (error.response?.status === 401) {
      authHelper.clearToken();
    }
    
    return Promise.reject(error);
  }
);

export const getValidationErrors = (): { [key: string]: string } => {
  return { ...validationErrors };
};

export const clearValidationErrors = (): void => {
  validationErrors = {};
};

export default apiClient;