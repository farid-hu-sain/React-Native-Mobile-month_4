// src/services/apiClient.ts (UPDATED)
import axios from 'axios';
import { authHelper } from './authHelper';
import NetInfo from '@react-native-community/netinfo';
import { keychainService, KEYCHAIN_SERVICES } from './keychainService';

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