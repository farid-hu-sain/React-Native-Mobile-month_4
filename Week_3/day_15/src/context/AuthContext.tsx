// src/context/AuthContext.tsx (UPDATE)
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authUtils, User } from '../utils/auth';
import { STORAGE_KEYS } from '../constants/config';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  demoLogin: () => Promise<void>;
  appSettings: {
    theme: string;
    notifications: boolean;
    language: string;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Keys untuk multiGet
const INITIAL_LOAD_KEYS = [
  STORAGE_KEYS.AUTH_TOKEN,
  STORAGE_KEYS.USER_DATA,
  STORAGE_KEYS.THEME_PREFERENCE,
  STORAGE_KEYS.NOTIFICATION_SETTINGS,
  STORAGE_KEYS.LANGUAGE_PREFERENCE,
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'id',
  });

  // 1. OPTIMASI MULTI-KEY LOAD - Load semua data penting sekaligus
  const loadInitialData = async (): Promise<void> => {
    try {
      console.log('🚀 Loading initial data with multiGet...');
      
      const results = await AsyncStorage.multiGet(INITIAL_LOAD_KEYS);
      const dataMap = new Map(results);
      
      console.log('📊 MultiGet results:', {
        keys: INITIAL_LOAD_KEYS,
        found: results.filter(([_, value]) => value !== null).length
      });

      // Process auth data
      const token = dataMap.get(STORAGE_KEYS.AUTH_TOKEN);
      const userDataString = dataMap.get(STORAGE_KEYS.USER_DATA);

      if (token && userDataString) {
        const userData: User = JSON.parse(userDataString);
        authUtils.setToken(token, userData);
        setUser(userData);
        console.log('✅ Auth data loaded from multiGet');
      }

      // Process app settings
      const theme = dataMap.get(STORAGE_KEYS.THEME_PREFERENCE) || 'light';
      const notifications = dataMap.get(STORAGE_KEYS.NOTIFICATION_SETTINGS) !== 'false';
      const language = dataMap.get(STORAGE_KEYS.LANGUAGE_PREFERENCE) || 'id';

      setAppSettings({
        theme,
        notifications,
        language,
      });

      console.log('✅ App settings loaded:', { theme, notifications, language });

    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. CLEANUP TERPUSAT SAAT LOGOUT
  const cleanupOnLogout = async (): Promise<void> => {
    try {
      console.log('🧹 Starting centralized cleanup...');
      
      const keysToRemove = [
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        // Keep cart items on logout? Uncomment if you want to clear cart too
        // STORAGE_KEYS.CART_ITEMS,
      ];

      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`✅ Removed ${keysToRemove.length} sensitive items`);

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login...');
      
      const userData = await authUtils.login(username, password);
      
      // Save auth data using multiSet for better performance
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.AUTH_TOKEN, userData.token],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
      ]);
      
      setUser(userData);
      console.log('✅ Login successful');

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      await cleanupOnLogout();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function dengan cleanup terpusat
  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Logging out with centralized cleanup...');
      
      // Clear from authUtils
      authUtils.clearToken();
      
      // Clear from state
      setUser(null);
      
      // Perform centralized cleanup
      await cleanupOnLogout();
      
      console.log('✅ Logout successful');

    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  // Demo login function
  const demoLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🎮 Starting demo login...');
      
      authUtils.demoLogin();
      const userData = authUtils.getCurrentUser();
      
      if (userData) {
        // Save using multiSet
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.AUTH_TOKEN, userData.token],
          [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        ]);
        
        setUser(userData);
        console.log('✅ Demo login successful');
      }
    } catch (error) {
      console.error('❌ Demo login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    try {
      const isValid = await authUtils.checkTokenValidity();
      if (!isValid) {
        await logout();
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      await logout();
    }
  };

  // Load initial data on app start
  useEffect(() => {
    loadInitialData();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
    demoLogin,
    appSettings,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};