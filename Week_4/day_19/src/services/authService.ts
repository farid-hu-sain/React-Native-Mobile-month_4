// src/services/authService.ts
import apiClient from './apiClient';
import { keychainService } from './keychainService';
import { storageService } from './storageService';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

export const authService = {
  // Login simulation using DummyJSON auth
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user (simulated)
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      // Using a mock endpoint since DummyJSON doesn't have current user endpoint
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Refresh token (simulated)
  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  // === FITUR BARU: Token Management ===
  
  // Login dengan token management
  async loginWithTokenManagement(credentials: LoginCredentials): Promise<{ 
    authResponse: AuthResponse; 
    tokenSaved: boolean; 
    expiredAtSaved: boolean; 
  }> {
    try {
      const authResponse = await this.login(credentials);
      
      // Simpan token di Keychain
      const tokenSaved = await keychainService.saveAccessToken(authResponse.token);
      
      // Simpan expiredAt di AsyncStorage (24 jam)
      const expiredAtSaved = await storageService.saveTokenExpiredAt();
      
      return {
        authResponse,
        tokenSaved,
        expiredAtSaved
      };
    } catch (error) {
      console.error('Login with token management error:', error);
      // Cleanup jika gagal
      await keychainService.deleteAccessToken();
      await storageService.deleteTokenExpiredAt();
      throw error;
    }
  },

  // Cek status login dengan validasi token expired
  async isUserLoggedIn(): Promise<boolean> {
    try {
      const token = await keychainService.getAccessToken();
      const isTokenExpired = await storageService.isTokenExpired();
      
      if (!token || isTokenExpired) {
        // Auto cleanup jika token expired atau tidak ada
        if (token) {
          console.log('🔄 Auto cleanup expired token');
          await this.cleanupTokenData();
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Get current token dengan validasi
  async getValidToken(): Promise<string | null> {
    try {
      const isLoggedIn = await this.isUserLoggedIn();
      if (!isLoggedIn) return null;
      
      return await keychainService.getAccessToken();
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  },

  // Cleanup token data
  async cleanupTokenData(): Promise<void> {
    try {
      await Promise.all([
        keychainService.deleteAccessToken(),
        storageService.deleteTokenExpiredAt()
      ]);
      console.log('✅ Token data cleaned up');
    } catch (error) {
      console.error('Error cleaning up token data:', error);
    }
  },

  // Validasi token dan auto cleanup jika expired
  async validateToken(): Promise<boolean> {
    return await this.isUserLoggedIn();
  }
};