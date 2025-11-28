// src/services/deepLinkingService.ts
import { Linking, Platform, Alert } from 'react-native';

export class DeepLinkingService {
  private static instance: DeepLinkingService;

  static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  // 5. TROUBLESHOOTING - Test deep linking availability
  async canOpenURL(url: string): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      console.log(`🔗 Can open URL ${url}: ${canOpen}`);
      return canOpen;
    } catch (error) {
      console.error('❌ Error checking URL:', error);
      return false;
    }
  }

  // Open deep link dengan fallback
  async openDeepLink(url: string, fallbackUrl?: string): Promise<void> {
    try {
      const canOpen = await this.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        console.log(`✅ Deep link opened: ${url}`);
      } else if (fallbackUrl) {
        console.log(`🔄 Falling back to: ${fallbackUrl}`);
        await Linking.openURL(fallbackUrl);
      } else {
        Alert.alert('Error', 'Tidak dapat membuka tautan');
      }
    } catch (error) {
      console.error('❌ Error opening deep link:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membuka tautan');
    }
  }

  // Generate deep link URL
  generateDeepLink(route: string, params?: Record<string, string>): string {
    let url = `ecommerceapp://${route}`;
    
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      if (queryParams) {
        url += `?${queryParams}`;
      }
    }
    
    return url;
  }

  // 5. UNIVERSAL LINKS FALLBACK
  generateUniversalLink(route: string, params?: Record<string, string>): string {
    let url = `https://ecommerceapp.com/${route}`;
    
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      if (queryParams) {
        url += `?${queryParams}`;
      }
    }
    
    return url;
  }

  // Handle common deep linking issues
  troubleshootDeepLinkingIssue(issue: string): string {
    const issues: Record<string, string> = {
      'android_not_opening': 'Pastikan intent filter sudah dikonfigurasi di AndroidManifest.xml',
      'ios_not_opening': 'Pastikan URL scheme sudah ditambahkan di Info.plist',
      'parameter_missing': 'Parameter tidak terbaca, pastikan format URL benar',
      'app_not_installed': 'Aplikasi tidak terinstall, gunakan universal links',
    };

    return issues[issue] || 'Unknown issue, check console for details';
  }
}

export const deepLinkingService = DeepLinkingService.getInstance();