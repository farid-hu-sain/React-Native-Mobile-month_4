// src/context/AuthContext.tsx (UPDATED)
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authUtils, User } from '../utils/auth';
import { STORAGE_KEYS } from '../constants/config';
import { keychainService, KEYCHAIN_SERVICES } from '../services/keychainService';

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
  secureStorageError: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [secureStorageError, setSecureStorageError] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'id',
  });

  // 2. HYBRID STORAGE - Load dari Keychain & AsyncStorage secara paralel
  const loadInitialData = async (): Promise<void> => {
    try {
      console.log('🚀 Loading hybrid storage data...');
      
      // Paralel loading dari kedua storage systems
      const [keychainResult, asyncStorageResult] = await Promise.allSettled([
        // 1. Load token dari Keychain (secure)
        keychainService.getCredentials(KEYCHAIN_SERVICES.USER_TOKEN),
        // 2. Load preferences dari AsyncStorage (non-sensitive)
        AsyncStorage.multiGet([
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.THEME_PREFERENCE,
          STORAGE_KEYS.NOTIFICATION_SETTINGS,
          STORAGE_KEYS.LANGUAGE_PREFERENCE,
        ]),
      ]);

      // Process Keychain result (token)
      if (keychainResult.status === 'fulfilled' && keychainResult.value) {
        const token = keychainResult.value.password;
        console.log('✅ Token loaded from Keychain');
        
        // Cari user data dari AsyncStorage
        const asyncDataMap = new Map(
          asyncStorageResult.status === 'fulfilled' ? asyncStorageResult.value : []
        );
        const userDataString = asyncDataMap.get(STORAGE_KEYS.USER_DATA);
        
        if (userDataString) {
          const userData: User = JSON.parse(userDataString);
          authUtils.setToken(token, userData);
          setUser(userData);
          console.log('✅ User data loaded from AsyncStorage');
        }
      } else if (keychainResult.status === 'rejected') {
        // 3. HANDLE ACCESS DENIED ERROR
        const error = keychainResult.reason;
        console.error('❌ Keychain access error:', error);
        
        if (error.message.includes('ACCESS_DENIED')) {
          setSecureStorageError(error.message);
          // Reset token dan paksa login ulang
          await keychainService.resetCredentials(KEYCHAIN_SERVICES.USER_TOKEN);
          Alert.alert(
            'Keamanan Perubahan', 
            'Keamanan perangkat diubah, mohon login ulang.',
            [{ text: 'OK' }]
          );
        }
      }

      // Process AsyncStorage result (preferences)
      if (asyncStorageResult.status === 'fulfilled') {
        const dataMap = new Map(asyncStorageResult.value);
        
        const theme = dataMap.get(STORAGE_KEYS.THEME_PREFERENCE) || 'light';
        const notifications = dataMap.get(STORAGE_KEYS.NOTIFICATION_SETTINGS) !== 'false';
        const language = dataMap.get(STORAGE_KEYS.LANGUAGE_PREFERENCE) || 'id';

        setAppSettings({ theme, notifications, language });
        console.log('✅ App settings loaded from AsyncStorage');
      }

    } catch (error) {
      console.error('❌ Failed to load hybrid storage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. CLEANUP TERPUSAT DENGAN KEYCHAIN
  const cleanupOnLogout = async (): Promise<void> => {
    try {
      console.log('🧹 Starting secure cleanup...');
      
      // Hapus dari AsyncStorage
      const keysToRemove = [
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.THEME_PREFERENCE,
        STORAGE_KEYS.NOTIFICATION_SETTINGS,
        STORAGE_KEYS.LANGUAGE_PREFERENCE,
      ];

      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`✅ Removed ${keysToRemove.length} items from AsyncStorage`);

      // Hapus dari Keychain
      await keychainService.resetCredentials(KEYCHAIN_SERVICES.USER_TOKEN);
      console.log('✅ Removed token from Keychain');

    } catch (error) {
      console.error('❌ Secure cleanup failed:', error);
    }
  };

  // 1. MIGRASI TOKEN KE KEYSTORE
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setSecureStorageError(null);
      console.log('🔐 Attempting login with Keychain...');
      
      const userData = await authUtils.login(username, password);
      
      // Simpan token ke Keychain (secure)
      await keychainService.setCredentials(
        userData.username, 
        userData.token, 
        KEYCHAIN_SERVICES.USER_TOKEN
      );
      
      // Simpan user data ke AsyncStorage (non-sensitive)
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(userData)
      );
      
      setUser(userData);
      console.log('✅ Login successful with Keychain storage');

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      await cleanupOnLogout();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout dengan secure cleanup
  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Secure logout started...');
      
      // Clear dari authUtils
      authUtils.clearToken();
      
      // Clear dari state
      setUser(null);
      setSecureStorageError(null);
      
      // Perform secure cleanup SEBELUM navigation
      await cleanupOnLogout();
      
      console.log('✅ Secure logout completed');

    } catch (error) {
      console.error('❌ Secure logout failed:', error);
    }
  };

  // Demo login dengan Keychain
  const demoLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🎮 Starting demo login with Keychain...');
      
      authUtils.demoLogin();
      const userData = authUtils.getCurrentUser();
      
      if (userData) {
        // Simpan ke Keychain
        await keychainService.setCredentials(
          userData.username, 
          userData.token, 
          KEYCHAIN_SERVICES.USER_TOKEN
        );
        
        // Simpan ke AsyncStorage
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA, 
          JSON.stringify(userData)
        );
        
        setUser(userData);
        console.log('✅ Demo login successful with Keychain');
      }
    } catch (error) {
      console.error('❌ Demo login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    secureStorageError,
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