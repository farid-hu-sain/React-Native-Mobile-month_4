// src/utils/imagePicker.ts
import { 
  launchImageLibrary, 
  launchCamera, 
  CameraOptions, 
  ImageLibraryOptions,
  Asset 
} from 'react-native-image-picker';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImagePickerResult {
  success: boolean;
  assets?: Asset[];
  error?: string;
  errorCode?: string;
}

export const imagePickerUtils = {
  // Untuk produk - maksimal 5 foto
  async selectProductImages(): Promise<ImagePickerResult> {
    try {
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: 5,
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8,
        includeExtra: true,
      };

      console.log('🖼️ Opening image library for product images...');
      
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        console.log('👤 User cancelled image selection');
        return { success: false, error: 'User cancelled' };
      }

      if (result.errorCode) {
        console.error('❌ Image picker error:', result.errorCode, result.errorMessage);
        return { 
          success: false, 
          error: result.errorMessage || 'Unknown error',
          errorCode: result.errorCode 
        };
      }

      if (result.assets && result.assets.length > 0) {
        console.log(`✅ Selected ${result.assets.length} images for product`);
        
        // Format assets untuk disimpan
        const selectedAssets = result.assets.map(asset => ({
          uri: asset.uri!,
          fileName: asset.fileName || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
          type: asset.type || 'image/jpeg',
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
        }));

        // Simpan ke AsyncStorage
        await AsyncStorage.setItem('@ecom:newProductAssets', JSON.stringify(selectedAssets));
        console.log('💾 Product assets saved to AsyncStorage');
        
        return { 
          success: true, 
          assets: result.assets 
        };
      }

      return { success: false, error: 'No images selected' };
      
    } catch (error) {
      console.error('❌ Error selecting product images:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Untuk KTP - dengan permission handling
  async takeKTPPhoto(): Promise<ImagePickerResult> {
    return new Promise(async (resolve) => {
      try {
        // Request storage permission untuk Android
        let hasStoragePermission = false;
        
        if (Platform.OS === 'android') {
          hasStoragePermission = await this.requestStoragePermission();
        }

        const options: CameraOptions = {
          mediaType: 'photo',
          cameraType: 'back',
          saveToPhotos: hasStoragePermission,
          quality: 0.7,
          maxWidth: 1024,
          maxHeight: 1024,
          includeExtra: true,
        };

        console.log('📷 Opening camera for KTP photo...');
        
        launchCamera(options, (response) => {
          // Handle camera errors
          if (response.errorCode === 'camera_unavailable') {
            console.error('❌ Camera unavailable');
            Alert.alert(
              'Kamera Tidak Tersedia',
              'Kamera sedang digunakan atau tidak dapat diakses. Gunakan foto dari galeri?',
              [
                { text: 'Batal', style: 'cancel', onPress: () => resolve({ success: false, error: 'Camera unavailable' }) },
                { 
                  text: 'Pilih dari Galeri', 
                  onPress: async () => {
                    try {
                      const galleryResult = await this.selectSingleImage();
                      resolve(galleryResult);
                    } catch (error) {
                      resolve({ success: false, error: 'Gallery selection failed' });
                    }
                  }
                }
              ]
            );
            return;
          }

          if (response.errorCode) {
            console.error('❌ Camera error:', response.errorCode, response.errorMessage);
            resolve({ 
              success: false, 
              error: response.errorMessage || 'Camera error',
              errorCode: response.errorCode 
            });
            return;
          }

          if (response.didCancel) {
            console.log('👤 User cancelled camera');
            resolve({ success: false, error: 'User cancelled' });
            return;
          }

          if (response.assets && response.assets[0]) {
            console.log('✅ KTP photo taken successfully');
            resolve({ 
              success: true, 
              assets: response.assets 
            });
          } else {
            resolve({ success: false, error: 'No photo taken' });
          }
        });

      } catch (error) {
        console.error('❌ Error taking KTP photo:', error);
        resolve({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });
  },

  // Untuk preview profil offline - dengan base64
  async selectProfilePicture(): Promise<ImagePickerResult> {
    try {
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: 1,
        maxWidth: 300,
        maxHeight: 300,
        includeBase64: true,
        quality: 0.6,
        includeExtra: true,
      };

      console.log('🖼️ Selecting profile picture...');
      
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        return { success: false, error: 'User cancelled' };
      }

      if (result.errorCode) {
        return { 
          success: false, 
          error: result.errorMessage || 'Image picker error',
          errorCode: result.errorCode 
        };
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('✅ Profile picture selected');

        // Simpan base64 untuk offline preview
        if (asset.base64) {
          await AsyncStorage.setItem('@ecom:profilePreview', asset.base64);
          console.log('💾 Profile preview base64 saved to AsyncStorage');
        }

        return { 
          success: true, 
          assets: result.assets 
        };
      }

      return { success: false, error: 'No image selected' };
      
    } catch (error) {
      console.error('❌ Error selecting profile picture:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Request storage permission untuk Android
  async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      // Untuk Android 13+ (API level 33), gunakan READ_MEDIA_IMAGES
      const permission = Platform.Version >= 33 ? 
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES :
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

      const granted = await PermissionsAndroid.request(
        permission,
        {
          title: 'Izin Penyimpanan Foto',
          message: 'Aplikasi membutuhkan izin untuk menyimpan foto ke galeri perangkat Anda',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Tolak',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Storage permission granted');
        return true;
      } else {
        console.log('❌ Storage permission denied');
        Alert.alert(
          'Izin Ditolak',
          'Foto tidak akan disimpan ke galeri publik. Foto hanya akan digunakan untuk proses verifikasi.'
        );
        return false;
      }
    } catch (err) {
      console.warn('❌ Permission error:', err);
      return false;
    }
  },

  // Single image selection untuk fallback
  async selectSingleImage(): Promise<ImagePickerResult> {
    try {
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.7,
        includeExtra: true,
      };

      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        return { success: false, error: 'User cancelled' };
      }

      if (result.errorCode) {
        return { 
          success: false, 
          error: result.errorMessage || 'Image picker error',
          errorCode: result.errorCode 
        };
      }

      if (result.assets && result.assets[0]) {
        return { 
          success: true, 
          assets: result.assets 
        };
      }
      
      return { success: false, error: 'No image selected' };
      
    } catch (error) {
      console.error('❌ Error selecting single image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Get stored product assets dari AsyncStorage
  async getStoredProductAssets(): Promise<any[]> {
    try {
      const storedAssets = await AsyncStorage.getItem('@ecom:newProductAssets');
      if (storedAssets) {
        return JSON.parse(storedAssets);
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting stored product assets:', error);
      return [];
    }
  },

  // Clear stored product assets
  async clearStoredProductAssets(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@ecom:newProductAssets');
      console.log('🧹 Stored product assets cleared');
    } catch (error) {
      console.error('❌ Error clearing stored product assets:', error);
    }
  },

  // Get stored profile preview
  async getStoredProfilePreview(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@ecom:profilePreview');
    } catch (error) {
      console.error('❌ Error getting stored profile preview:', error);
      return null;
    }
  }
};