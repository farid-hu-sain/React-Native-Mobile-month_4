import apiClient from './apiClient';

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
};