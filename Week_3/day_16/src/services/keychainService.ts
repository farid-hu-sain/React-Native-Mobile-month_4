// src/services/keychainService.ts
import * as Keychain from 'react-native-keychain';

export interface KeychainCredentials {
  username: string;
  password: string;
  service: string;
}

// Namespacing services untuk isolasi
export const KEYCHAIN_SERVICES = {
  USER_TOKEN: 'com.ecom:userToken',
  API_KEY: 'com.ecom:apiKey',
};

export const keychainService = {
  // Simpan credentials ke Keychain
  async setCredentials(
    username: string, 
    password: string, 
    service: string = KEYCHAIN_SERVICES.USER_TOKEN
  ): Promise<boolean> {
    try {
      console.log(`🔐 Saving credentials to Keychain service: ${service}`);
      const result = await Keychain.setGenericPassword(username, password, {
        service,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      
      if (result === false) {
        throw new Error('Failed to save credentials to Keychain');
      }
      
      console.log(`✅ Credentials saved successfully to ${service}`);
      return true;
    } catch (error: any) {
      console.error('❌ Keychain setCredentials error:', error);
      throw new Error(`Gagal menyimpan data ke secure storage: ${error.message}`);
    }
  },

  // Ambil credentials dari Keychain
  async getCredentials(service: string = KEYCHAIN_SERVICES.USER_TOKEN): Promise<KeychainCredentials | null> {
    try {
      console.log(`🔐 Retrieving credentials from Keychain service: ${service}`);
      const credentials = await Keychain.getGenericPassword({ service });
      
      if (credentials) {
        console.log(`✅ Credentials retrieved successfully from ${service}`);
        return {
          username: credentials.username,
          password: credentials.password,
          service,
        };
      }
      
      console.log(`ℹ️ No credentials found in Keychain service: ${service}`);
      return null;
    } catch (error: any) {
      console.error('❌ Keychain getCredentials error:', error);
      
      // Handle specific access denied errors
      if (error.message.includes('access denied') || error.message.includes('security')) {
        throw new Error('ACCESS_DENIED: Keamanan perangkat diubah, mohon login ulang.');
      }
      
      throw new Error(`Gagal mengambil data dari secure storage: ${error.message}`);
    }
  },

  // Hapus credentials dari Keychain
  async resetCredentials(service: string = KEYCHAIN_SERVICES.USER_TOKEN): Promise<boolean> {
    try {
      console.log(`🔐 Resetting credentials from Keychain service: ${service}`);
      const result = await Keychain.resetGenericPassword({ service });
      
      if (result === false) {
        throw new Error('Failed to reset credentials from Keychain');
      }
      
      console.log(`✅ Credentials reset successfully from ${service}`);
      return true;
    } catch (error: any) {
      console.error('❌ Keychain resetCredentials error:', error);
      throw new Error(`Gagal menghapus data dari secure storage: ${error.message}`);
    }
  },

  // Simpan API Key secara secure
  async saveApiKey(apiKey: string): Promise<boolean> {
    try {
      return await this.setCredentials('api_client', apiKey, KEYCHAIN_SERVICES.API_KEY);
    } catch (error) {
      console.error('❌ Failed to save API key:', error);
      throw error;
    }
  },

  // Ambil API Key secara secure
  async getApiKey(): Promise<string | null> {
    try {
      const credentials = await this.getCredentials(KEYCHAIN_SERVICES.API_KEY);
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('❌ Failed to get API key:', error);
      throw error;
    }
  },

  // Hapus API Key
  async resetApiKey(): Promise<boolean> {
    try {
      return await this.resetCredentials(KEYCHAIN_SERVICES.API_KEY);
    } catch (error) {
      console.error('❌ Failed to reset API key:', error);
      throw error;
    }
  },
};