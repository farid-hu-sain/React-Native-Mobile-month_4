// src/services/uploadService.ts
import { Platform, Alert } from 'react-native';

export const uploadService = {
  async uploadKTPPhoto(photoAsset: any, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('📤 Starting KTP photo upload...');
        
        const formData = new FormData();
        
        formData.append('ktp_photo', {
          uri: Platform.OS === 'ios' ? photoAsset.uri.replace('file://', '') : photoAsset.uri,
          type: photoAsset.type || 'image/jpeg',
          name: photoAsset.fileName || `ktp_${Date.now()}.jpg`,
        });

        // Simulate progress (in real app, use XMLHttpRequest for actual progress)
        if (onProgress) {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            onProgress(progress);
            if (progress >= 90) clearInterval(interval);
          }, 100);
        }

        // Simulate API call (replace with actual endpoint)
        setTimeout(async () => {
          try {
            // In real implementation, use actual fetch:
            // const response = await fetch('https://your-api.com/upload/ktp', {
            //   method: 'POST',
            //   body: formData,
            //   headers: {
            //     'Content-Type': 'multipart/form-data',
            //   },
            // });

            // if (!response.ok) throw new Error('Upload failed');
            // const result = await response.json();

            // Simulate successful upload
            const simulatedResult = {
              success: true,
              imageUrl: `https://example.com/ktp_${Date.now()}.jpg`,
              message: 'KTP photo uploaded successfully'
            };

            if (onProgress) onProgress(100);
            
            console.log('✅ KTP photo uploaded successfully');
            resolve(simulatedResult.imageUrl);
            
          } catch (error) {
            console.error('❌ KTP upload error:', error);
            reject(new Error('Gagal mengupload foto KTP'));
          }
        }, 2000);

      } catch (error) {
        console.error('❌ KTP upload preparation error:', error);
        reject(new Error('Gagal mempersiapkan upload foto KTP'));
      }
    });
  },

  async uploadProductImages(images: any[], onProgress?: (progress: number) => void): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`📤 Starting upload for ${images.length} product images...`);
        
        const totalImages = images.length;
        let uploadedCount = 0;
        const uploadedUrls: string[] = [];

        // Simulate progress
        if (onProgress) {
          onProgress(0);
        }

        // Upload images sequentially to simulate real upload
        for (let i = 0; i < images.length; i++) {
          try {
            const image = images[i];
            const formData = new FormData();
            
            formData.append('product_images', {
              uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `product_${Date.now()}_${i}.jpg`,
            });

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Simulate successful upload
            uploadedUrls.push(`https://example.com/products/product_${Date.now()}_${i}.jpg`);
            uploadedCount++;

            // Update progress
            if (onProgress) {
              const progress = Math.round((uploadedCount / totalImages) * 100);
              onProgress(progress);
            }

            console.log(`✅ Uploaded image ${i + 1}/${totalImages}`);

          } catch (error) {
            console.error(`❌ Failed to upload image ${i + 1}:`, error);
            // Continue with other images even if one fails
            uploadedUrls.push(`https://example.com/fallback_${i}.jpg`);
          }
        }

        console.log(`✅ Successfully uploaded ${uploadedUrls.length} product images`);
        resolve(uploadedUrls);

      } catch (error) {
        console.error('❌ Product images upload error:', error);
        reject(new Error('Gagal mengupload gambar produk'));
      }
    });
  },

  async uploadProfilePicture(imageAsset: any, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('📤 Starting profile picture upload...');
        
        const formData = new FormData();
        
        formData.append('profile_picture', {
          uri: Platform.OS === 'ios' ? imageAsset.uri.replace('file://', '') : imageAsset.uri,
          type: imageAsset.type || 'image/jpeg',
          name: imageAsset.fileName || `profile_${Date.now()}.jpg`,
        });

        // Simulate progress
        if (onProgress) {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            onProgress(progress);
            if (progress >= 100) clearInterval(interval);
          }, 200);
        }

        // Simulate API call
        setTimeout(() => {
          const simulatedUrl = `https://example.com/profiles/profile_${Date.now()}.jpg`;
          console.log('✅ Profile picture uploaded successfully');
          resolve(simulatedUrl);
        }, 1000);

      } catch (error) {
        console.error('❌ Profile picture upload error:', error);
        reject(new Error('Gagal mengupload foto profil'));
      }
    });
  }
};