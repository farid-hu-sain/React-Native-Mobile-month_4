// src/context/AuthContext.tsx - FIXED FULL VERSION
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import authUtils, { User } from '../utils/auth';
import { STORAGE_KEYS } from '../constants/config';
import { keychainService, KEYCHAIN_SERVICES } from '../services/keychainService';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { biometricService } from '../services/biometricService';

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
  tokenRemainingTime: string;
  // Storage health features
  storageHealth: {
    status: 'healthy' | 'corrupted' | 'unknown';
    lastCheck: string | null;
    corruptionCount: number;
  };
  initializeAuth: () => Promise<void>;
  repairStorage: () => Promise<void>;
  checkStorageHealth: () => Promise<void>;
  // BIOMETRIC FEATURES
  biometricType: string;
  isBiometricAvailable: boolean;
  quickLogin: () => Promise<void>;
  saveTokenForBiometric: (token: string) => Promise<boolean>;
  checkBiometricAvailability: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [secureStorageError, setSecureStorageError] = useState<string | null>(null);
  const [tokenRemainingTime, setTokenRemainingTime] = useState<string>('');
  const [storageHealth, setStorageHealth] = useState({
    status: 'unknown' as 'healthy' | 'corrupted' | 'unknown',
    lastCheck: null as string | null,
    corruptionCount: 0
  });
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'id',
  });
  // TAMBAH STATE BIOMETRIC
  const [biometricType, setBiometricType] = useState<string>('none');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // FIXED: Check biometric availability dengan error handling
  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      console.log('🔐 Checking biometric availability...');
      
      // Gunakan safe check dulu untuk avoid error
      const { available, type } = await biometricService.safeBiometricCheck();
      
      setIsBiometricAvailable(available);
      setBiometricType(type);
      
      console.log('🔐 Biometric availability:', { available, type });
      
    } catch (error) {
      console.error('❌ Biometric availability check failed:', error);
      // Jangan throw error, cukup set ke false
      setIsBiometricAvailable(false);
      setBiometricType('none');
    }
  };

  // FIXED: Quick Login dengan Biometric dengan better error handling
  const quickLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check biometric availability dengan safe method
      const { available } = await biometricService.safeBiometricCheck();
      
      if (!available) {
        // Handle "Not Enrolled" case
        Alert.alert(
          'Biometric Tidak Tersedia',
          'Perangkat Anda tidak mendukung biometric atau belum diatur.',
          [
            { text: 'OK' },
            { 
              text: 'Pengaturan', 
              onPress: () => biometricService.openBiometricSettings() 
            }
          ]
        );
        return;
      }

      // Get dynamic prompt message based on biometric type
      const promptMessage = biometricService.getPromptMessage(biometricType, 'login');
      
      // Trigger biometric prompt
      const result = await biometricService.simplePrompt({
        promptMessage,
        cancelButtonText: 'Batal'
      });

      if (result.success) {
        // Retrieve token from Keychain
        const credentials = await biometricService.getTokenFromKeychain();
        
        if (credentials && credentials.token) {
          // Set token in memory and update user state
          authUtils.setToken(credentials.token, { username: credentials.username });
          
          const userData = {
            id: 1,
            username: credentials.username,
            email: `${credentials.username}@example.com`,
            firstName: 'User',
            lastName: 'Biometric',
            gender: 'male',
            image: '',
            token: credentials.token
          };
          
          setUser(userData);
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
          await updateTokenRemainingTime();
          
          console.log('✅ Quick login successful with biometric');
          Alert.alert('Success', 'Login berhasil dengan biometrik!');
        } else {
          throw new Error('Token tidak ditemukan. Silakan login manual terlebih dahulu.');
        }
      } else {
        // Handle lockout case
        if (result.code === 'LOCKOUT') {
          await biometricService.handleBiometricLockout();
          await logout();
          throw new Error('Sensor terkunci. Silakan login ulang.');
        }
        
        throw new Error('Autentikasi biometrik gagal atau dibatalkan');
      }
      
    } catch (error: any) {
      console.error('❌ Quick login failed:', error);
      Alert.alert('Login Gagal', error.message || 'Terjadi kesalahan saat login biometric');
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCTION: Save token for biometric after manual login
  const saveTokenForBiometric = async (token: string): Promise<boolean> => {
    try {
      if (!user) {
        throw new Error('User not available');
      }
      
      const success = await biometricService.saveTokenToKeychain(token, user.username);
      
      if (success) {
        console.log('✅ Token saved for biometric login');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to save token for biometric:', error);
      return false;
    }
  };

  // NEW: Check storage health
  const checkStorageHealth = async (): Promise<void> => {
    try {
      console.log('🔍 Checking storage health...');
      const health = await storageService.getStorageHealth();
      setStorageHealth({
        status: health.status,
        lastCheck: health.lastCheck,
        corruptionCount: health.corruptionCount
      });
      
      if (health.status === 'corrupted') {
        console.warn('🚨 Storage corruption detected');
      }
    } catch (error) {
      console.error('❌ Storage health check failed:', error);
    }
  };

  // NEW: Repair storage
  const repairStorage = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🛠️ Starting storage repair...');
      
      const healthCheck = await storageService.detectAndRepairCorruption();
      
      if (healthCheck.corruptedItems > 0) {
        Alert.alert(
          'Storage Repair Completed',
          `Repaired ${healthCheck.repairedItems} corrupted items. ${healthCheck.errors.length > 0 ? 'Some errors occurred.' : ''}`
        );
      } else {
        Alert.alert('Storage Healthy', 'No corrupted data found.');
      }
      
      await checkStorageHealth();
      
    } catch (error) {
      console.error('❌ Storage repair failed:', error);
      Alert.alert('Repair Failed', 'Unable to repair storage data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update token remaining time
  const updateTokenRemainingTime = async (): Promise<void> => {
    try {
      const remainingTime = await authUtils.getFormattedRemainingTime();
      setTokenRemainingTime(remainingTime);
    } catch (error) {
      console.error('Error updating token remaining time:', error);
      setTokenRemainingTime('Unknown');
    }
  };

  // Enhanced startup initialization dengan storage health check
  const initializeAuth = async (): Promise<void> => {
    try {
      console.log('🚀 Starting enhanced auth initialization...');
      
      // 1. Check storage health terlebih dahulu
      await checkStorageHealth();
      
      // 2. Jika ada corruption, attempt repair
      if (storageHealth.status === 'corrupted') {
        console.log('🛠️ Storage corrupted, attempting repair...');
        await repairStorage();
      }

      // 3. Check biometric availability (dengan safe method)
      await checkBiometricAvailability();

      // 4. Paralel loading dari storage systems
      const [keychainResult, asyncStorageResult] = await Promise.allSettled([
        keychainService.getCredentials(KEYCHAIN_SERVICES.USER_TOKEN),
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
        
        const isTokenExpired = await authService.isUserLoggedIn();
        
        if (!isTokenExpired) {
          const asyncDataMap = new Map(
            asyncStorageResult.status === 'fulfilled' ? asyncStorageResult.value : []
          );
          const userDataString = asyncDataMap.get(STORAGE_KEYS.USER_DATA);
          
          if (userDataString) {
            // Use safe parsing untuk user data
            const userData = storageService.safeJSONParse(userDataString, null, STORAGE_KEYS.USER_DATA);
            
            if (userData && userData && userData) {
              authUtils.setToken(token, userData);
              setUser(userData);
              console.log('✅ User data loaded from AsyncStorage');
              await updateTokenRemainingTime();
            } else {
              console.warn('⚠️ Invalid user data structure, clearing...');
              await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            }
          }
        } else {
          console.log('❌ Token expired during initial load');
          await cleanupOnLogout();
        }
      } else if (keychainResult.status === 'rejected') {
        const error = keychainResult.reason;
        console.error('❌ Keychain access error:', error);
        
        if (error.message.includes('ACCESS_DENIED')) {
          setSecureStorageError(error.message);
          await keychainService.resetCredentials(KEYCHAIN_SERVICES.USER_TOKEN);
        }
      }

      // Process AsyncStorage result (preferences) dengan safe parsing
      if (asyncStorageResult.status === 'fulfilled') {
        const dataMap = new Map(asyncStorageResult.value);
        
        const theme = storageService.safeJSONParse(
          dataMap.get(STORAGE_KEYS.THEME_PREFERENCE) || null, 
          'light', 
          STORAGE_KEYS.THEME_PREFERENCE
        );
        const notifications = storageService.safeJSONParse(
          dataMap.get(STORAGE_KEYS.NOTIFICATION_SETTINGS) || null, 
          true, 
          STORAGE_KEYS.NOTIFICATION_SETTINGS
        );
        const language = storageService.safeJSONParse(
          dataMap.get(STORAGE_KEYS.LANGUAGE_PREFERENCE) || null, 
          'id', 
          STORAGE_KEYS.LANGUAGE_PREFERENCE
        );

        setAppSettings({ theme, notifications, language });
        console.log('✅ App settings loaded from AsyncStorage');
      }

      console.log('✅ Enhanced auth initialization completed');

    } catch (error) {
      console.error('❌ Enhanced auth initialization failed:', error);
      
      // Fallback: reset to default state
      setUser(null);
      setAppSettings({
        theme: 'light',
        notifications: true,
        language: 'id',
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on logout
  const cleanupOnLogout = async (): Promise<void> => {
    try {
      console.log('🧹 Starting secure cleanup...');
      
      const keysToRemove = [
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.THEME_PREFERENCE,
        STORAGE_KEYS.NOTIFICATION_SETTINGS,
        STORAGE_KEYS.LANGUAGE_PREFERENCE,
      ];

      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`✅ Removed ${keysToRemove.length} items from AsyncStorage`);

      await keychainService.resetCredentials(KEYCHAIN_SERVICES.USER_TOKEN);
      console.log('✅ Removed token from Keychain');

      // Clear biometric data juga
      await biometricService.clearKeychain();
      console.log('✅ Cleared biometric data from Keychain');

      setTokenRemainingTime('');

    } catch (error) {
      console.error('❌ Secure cleanup failed:', error);
    }
  };

  // FIXED: Login method dengan safe login
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setSecureStorageError(null);
      console.log('🔐 Attempting safe login...');
      
      // GUNAKAN SAFE LOGIN YANG BARU
      const userData = await authUtils.safeLogin(username, password);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(userData)
      );
      
      setUser(userData);
      await updateTokenRemainingTime();
      
      console.log('✅ Safe login successful');
      
      // Show success message
      Alert.alert(
        "Login Berhasil", 
        `Selamat datang ${userData.firstName}!`,
        [{ text: "OK" }]
      );

    } catch (error: any) {
      console.error('❌ Safe login failed:', error);
      await cleanupOnLogout();
      setUser(null);
      
      // Show user-friendly error message
      Alert.alert(
        "Login Gagal", 
        "Terjadi masalah dengan server. Mode offline diaktifkan.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Logout dengan secure cleanup
  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Secure logout started...');
      
      await authUtils.logoutWithTokenCleanup();
      
      setUser(null);
      setSecureStorageError(null);
      
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
      
      await authUtils.demoLoginWithTokenManagement();
      const userData = authUtils.getCurrentUser();
      
      if (userData) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA, 
          JSON.stringify(userData)
        );
        
        setUser(userData);
        await updateTokenRemainingTime();
        
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
      const isValid = await authService.validateToken();
      if (!isValid) {
        await logout();
      } else {
        await updateTokenRemainingTime();
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      await logout();
    }
  };

  // Periodic token check
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        updateTokenRemainingTime();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Load initial data on app start
  useEffect(() => {
    initializeAuth();
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
    tokenRemainingTime,
    // Storage health features
    storageHealth,
    initializeAuth,
    repairStorage,
    checkStorageHealth,
    // BIOMETRIC FEATURES
    biometricType,
    isBiometricAvailable,
    quickLogin,
    saveTokenForBiometric,
    checkBiometricAvailability,
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