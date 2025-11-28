// src/utils/auth.ts
import { authService } from '../services/authService';
import { keychainService } from '../services/keychainService';
import { storageService } from '../services/storageService';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

let authToken: string | null = null;
let currentUser: User | null = null;

export const authUtils = {
  // Set token and user data
  setToken: (token: string, userData?: Partial<User>): void => {
    authToken = token;
    
    if (userData) {
      currentUser = {
        id: userData.id || 1,
        username: userData.username || 'user123',
        email: userData.email || 'user123@example.com',
        firstName: userData.firstName || 'User',
        lastName: userData.lastName || 'Demo',
        gender: userData.gender || 'male',
        image: userData.image || '',
        token: token
      };
    } else {
      currentUser = {
        id: 1,
        username: 'user123',
        email: 'user123@example.com',
        firstName: 'User',
        lastName: 'Demo',
        gender: 'male',
        image: '',
        token: token
      };
    }
    
    console.log('🔐 Token set for user:', currentUser.username);
  },
  
  // Get current auth token
  getToken: (): string | null => {
    return authToken;
  },
  
  // Clear token and user data
  clearToken: (): void => {
    authToken = null;
    currentUser = null;
    console.log('🔐 Token cleared');
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authToken;
  },
  
  // Get current user data
  getCurrentUser: (): User | null => {
    return currentUser;
  },
  
  // Login method using Axios service
  async login(username: string, password: string): Promise<User> {
    try {
      console.log('🔐 Attempting login for user:', username);
      
      const response = await authService.login({ username, password });
      
      // Set token and user data
      this.setToken(response.token, {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image,
        token: response.token
      });
      
      console.log('✅ Login successful for user:', response.username);
      return response;
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        throw new Error('Username atau password salah');
      } else if (error.response?.status === 401) {
        throw new Error('Akun tidak terdaftar');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        throw new Error('Terjadi kesalahan saat login. Silakan coba lagi.');
      }
    }
  },

  // === FITUR BARU: Login dengan Token Management ===
  async loginWithTokenManagement(username: string, password: string): Promise<User> {
    try {
      console.log('🔐 Attempting login with token management for user:', username);
      
      const { authResponse, tokenSaved, expiredAtSaved } = await authService.loginWithTokenManagement({ 
        username, 
        password 
      });
      
      if (!tokenSaved || !expiredAtSaved) {
        throw new Error('Gagal menyimpan token. Silakan coba lagi.');
      }
      
      // Set token and user data di memory
      this.setToken(authResponse.token, {
        id: authResponse.id,
        username: authResponse.username,
        email: authResponse.email,
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        gender: authResponse.gender,
        image: authResponse.image,
        token: authResponse.token
      });
      
      console.log('✅ Login with token management successful for user:', authResponse.username);
      return authResponse;
      
    } catch (error: any) {
      console.error('❌ Login with token management failed:', error);
      throw error;
    }
  },
  
  // Logout method
  logout(): void {
    this.clearToken();
    console.log('👋 User logged out');
  },

  // === FITUR BARU: Logout dengan cleanup token ===
  async logoutWithTokenCleanup(): Promise<void> {
    try {
      // Clear dari memory
      this.clearToken();
      
      // Clear dari storage
      await authService.cleanupTokenData();
      
      console.log('👋 User logged out with token cleanup');
    } catch (error) {
      console.error('❌ Logout with token cleanup failed:', error);
      throw error;
    }
  },
  
  // Check token validity (simulated)
  async checkTokenValidity(): Promise<boolean> {
    if (!authToken) {
      return false;
    }
    
    try {
      // Gunakan token validation dari authService
      return await authService.validateToken();
    } catch (error) {
      console.error('Token validation failed:', error);
      this.clearToken();
      return false;
    }
  },
  
  // Refresh token method
  async refreshToken(): Promise<string> {
    try {
      const response = await authService.refreshToken();
      const newToken = response.token;
      
      authToken = newToken;
      if (currentUser) {
        currentUser.token = newToken;
      }
      
      console.log('🔄 Token refreshed successfully');
      return newToken;
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearToken();
      throw new Error('Session expired. Please login again.');
    }
  },
  
  // Get authorization header for API calls
  getAuthHeader(): { Authorization: string } | {} {
    if (authToken) {
      return { Authorization: `Bearer ${authToken}` };
    }
    return {};
  },
  
  // Update user profile (simulated)
  async updateProfile(profileData: Partial<User>): Promise<User> {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Simulate API call to update profile
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
      
      // Update local user data
      currentUser = { ...currentUser, ...profileData };
      console.log('📝 Profile updated successfully');
      
      return currentUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error('Failed to update profile');
    }
  },

  // Simulate password reset
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate API call
      return await new Promise<{ success: boolean; message: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Password reset instructions sent to your email'
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw new Error('Failed to reset password');
    }
  },

  // Check if user exists (simulated)
  async checkUserExists(username: string): Promise<boolean> {
    try {
      // Simulate API call
      return await new Promise<boolean>((resolve) => {
        setTimeout(() => {
          // Simulate checking against common usernames
          const existingUsers = ['admin', 'user', 'demo', 'test'];
          resolve(existingUsers.includes(username.toLowerCase()));
        }, 300);
      });
    } catch (error) {
      console.error('User existence check failed:', error);
      return false;
    }
  },

  // Simple demo login for onboarding
  demoLogin(): void {
    this.setToken('demo-token-12345', {
      username: 'demo_user',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      id: 999,
      gender: 'male',
      image: '',
      token: 'demo-token-12345'
    });
    console.log('🎮 Demo login completed');
  },

  // === FITUR BARU: Demo login dengan token management ===
  async demoLoginWithTokenManagement(): Promise<void> {
    try {
      // Simulate login process dengan token management
      const demoToken = 'demo-token-12345';
      const demoUser = {
        username: 'demo_user',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        id: 999,
        gender: 'male',
        image: '',
        token: demoToken
      };
      
      // Simpan token di Keychain
      await keychainService.saveAccessToken(demoToken);
      
      // Simpan expiredAt di AsyncStorage
      await storageService.saveTokenExpiredAt();
      
      // Set di memory
      this.setToken(demoToken, demoUser);
      
      console.log('🎮 Demo login with token management completed');
    } catch (error) {
      console.error('❌ Demo login with token management failed:', error);
      throw error;
    }
  },

  // Check if user has specific role (simulated)
  hasRole(role: string): boolean {
    if (!currentUser) return false;
    
    // Simple role simulation
    const userRoles: { [key: string]: string[] } = {
      'admin': ['admin'],
      'user123': ['user', 'premium'],
      'demo_user': ['user']
    };
    
    const roles = userRoles[currentUser.username] || ['user'];
    return roles.includes(role);
  },

  // Get user permissions (simulated)
  getPermissions(): string[] {
    if (!currentUser) return [];
    
    const permissionMap: { [key: string]: string[] } = {
      'admin': ['read', 'write', 'delete', 'manage_users'],
      'user123': ['read', 'write', 'purchase'],
      'demo_user': ['read', 'purchase']
    };
    
    return permissionMap[currentUser.username] || ['read', 'purchase'];
  },

  // === FITUR BARU: Token Validation Utils ===
  
  // Validasi token dan redirect jika expired
  async validateTokenAndRedirect(navigation: any): Promise<boolean> {
    try {
      const isLoggedIn = await authService.isUserLoggedIn();
      
      if (!isLoggedIn) {
        console.log('🔄 Token expired, redirecting to login...');
        // Clear memory data juga
        this.clearToken();
        
        // Redirect ke login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      // Jika error, assume not logged in dan redirect
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return false;
    }
  },

  // Cek sisa waktu token
  async getTokenRemainingTime(): Promise<number> {
    return await storageService.getTokenRemainingTime();
  },

  // Format sisa waktu token untuk display
  async getFormattedRemainingTime(): Promise<string> {
    const remainingMs = await this.getTokenRemainingTime();
    
    if (remainingMs === 0) return 'Expired';
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
};

// Export default untuk backward compatibility
export default authUtils;