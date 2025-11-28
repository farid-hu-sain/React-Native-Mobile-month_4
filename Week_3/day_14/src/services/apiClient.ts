// src/services/apiClient.ts
import axios from 'axios';
import { authHelper } from './authHelper';
import NetInfo from '@react-native-community/netinfo';

const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let validationErrors: { [key: string]: string } = {};

// NEW: Interceptor untuk cek koneksi sebelum request
apiClient.interceptors.request.use(
  async (config) => {
    const netInfo = await NetInfo.fetch();
    
    // Jika tidak ada koneksi internet, tolak request
    if (!netInfo.isInternetReachable) {
      console.log('🚫 Blocking API request - No internet connection');
      return Promise.reject({
        message: 'No internet connection',
        code: 'NETWORK_ERROR',
        isInternetReachable: false
      });
    }
    
    config.headers['X-Client-Platform'] = 'React-Native';
    
    const token = authHelper.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Clear validation errors pada response success
    validationErrors = {};
    return response;
  },
  (error) => {
    // Handle 400 Bad Request (Validation Errors)
    if (error.response?.status === 400) {
      console.log('🔍 HTTP 400 - Validation error detected');
      
      // Extract validation errors dari response body
      const errorData = error.response.data;
      
      if (errorData.errors && typeof errorData.errors === 'object') {
        // Simpan validation errors untuk digunakan di component
        validationErrors = errorData.errors;
        console.log('📋 Validation errors:', validationErrors);
        
        // Return error khusus untuk validation
        return Promise.reject({
          type: 'VALIDATION_ERROR',
          errors: validationErrors,
          message: 'Validation failed',
          status: 400
        });
      }
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      authHelper.clearToken();
    }
    
    return Promise.reject(error);
  }
);

// Export function untuk mendapatkan validation errors
export const getValidationErrors = (): { [key: string]: string } => {
  return { ...validationErrors };
};

// Export function untuk clear validation errors
export const clearValidationErrors = (): void => {
  validationErrors = {};
};

// PERUBAHAN PENTING: Export sebagai default dan named exports
export default apiClient;