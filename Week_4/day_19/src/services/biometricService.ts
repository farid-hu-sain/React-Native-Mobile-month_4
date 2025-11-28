// src/services/biometricService.ts - FIXED FULL VERSION
import { Alert, Platform, Linking } from 'react-native';
import Keychain from 'react-native-keychain';

export interface BiometricConfig {
  promptMessage: string;
  cancelButtonText?: string;
  fallbackEnabled?: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  code?: string;
  message?: string;
}

class BiometricService {
  
  // === 1. CHECK BIOMETRIC AVAILABILITY - DISABLED ===
  async isSensorAvailable(): Promise<{
    available: boolean;
    biometryType?: string;
    error?: string;
    code?: string;
  }> {
    console.log('🔐 Biometric temporarily disabled for build fix');
    return {
      available: false,
      biometryType: 'none',
      error: 'Biometric temporarily disabled',
      code: 'DISABLED_FOR_BUILD'
    };
  }

  // === 2. SIMPLE PROMPT - DISABLED ===
  async simplePrompt(config: BiometricConfig): Promise<BiometricResult> {
    console.log('🔐 Biometric prompt disabled:', config.promptMessage);
    
    return new Promise((resolve) => {
      Alert.alert(
        'Fitur Sementara Dinonaktifkan',
        'Fitur biometric sedang dalam perbaikan. Silakan gunakan login manual.',
        [
          { 
            text: 'OK', 
            onPress: () => resolve({
              success: false,
              error: 'Biometric temporarily disabled',
              code: 'DISABLED'
            })
          }
        ]
      );
    });
  }

  // === 3. KEYCHAIN INTEGRATION (MASIH BERFUNGSI) ===
  
  // Save token to Keychain after manual login
  async saveTokenToKeychain(token: string, username: string): Promise<boolean> {
    try {
      console.log('🔐 Saving token to Keychain for user:', username);
      
      const result = await Keychain.setGenericPassword(username, token, {
        service: 'com.ecommerce.auth',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      if (result) {
        console.log('✅ Token saved to Keychain successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to save token to Keychain:', error);
      return false;
    }
  }

  // Retrieve token from Keychain
  async getTokenFromKeychain(): Promise<{ username: string; token: string } | null> {
    try {
      console.log('🔐 Retrieving token from Keychain...');
      
      const credentials = await Keychain.getGenericPassword({
        service: 'com.ecommerce.auth'
      });

      if (credentials) {
        console.log('✅ Token retrieved from Keychain for user:', credentials.username);
        return {
          username: credentials.username,
          token: credentials.password
        };
      }
      
      console.log('❌ No credentials found in Keychain');
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve token from Keychain:', error);
      return null;
    }
  }

  // Clear token from Keychain (force logout)
  async clearKeychain(): Promise<boolean> {
    try {
      console.log('🔐 Clearing Keychain credentials...');
      
      const result = await Keychain.resetGenericPassword({
        service: 'com.ecommerce.auth'
      });

      if (result) {
        console.log('✅ Keychain credentials cleared successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to clear Keychain:', error);
      return false;
    }
  }

  // === 4. BIOMETRIC TYPE DETECTION - DISABLED ===
  async getBiometricType(): Promise<string> {
    return 'none';
  }

  // === 5. DYNAMIC PROMPT MESSAGES ===
  getPromptMessage(type: string, context: 'login' | 'transaction' | string = 'login', amount?: number): string {
    return 'Fitur biometric sedang dalam perbaikan';
  }

  // === 6. SECURITY: FORCE LOGOUT ON LOCKOUT ===
  async handleBiometricLockout(): Promise<void> {
    console.log('🚨 Biometric lockout handling disabled');
  }

  // === 7. OPEN BIOMETRIC SETTINGS ===
  async openBiometricSettings(): Promise<void> {
    Alert.alert('Info', 'Fitur biometric sedang dalam perbaikan');
  }

  // === 8. SAFE BIOMETRIC CHECK ===
  async safeBiometricCheck(): Promise<{available: boolean; type: string}> {
    return {
      available: false,
      type: 'none'
    };
  }

  // === 9. SIMPLE BIOMETRIC CHECK ===
  async simpleBiometricCheck(): Promise<boolean> {
    return false;
  }
}

// Export singleton instance
export const biometricService = new BiometricService();
export default biometricService;