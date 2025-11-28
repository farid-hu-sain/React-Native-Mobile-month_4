// src/utils/deepLinkTester.ts

import { deepLinkingService } from "../services/deeplinkingServices";

class DeepLinkTester {
  private testLinks = [
    'ecommerceapp://home',
    'ecommerceapp://produk/123',
    'ecommerceapp://keranjang',
    'ecommerceapp://profil/user123',
    'ecommerceapp://statistik',
    'https://ecommerceapp.com/home',
    'https://ecommerceapp.com/produk/456',
  ];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Deep Link Tests...');
    
    for (let i = 0; i < this.testLinks.length; i++) {
      const link = this.testLinks[i];
      await this.testSingleLink(link, i);
    }
    
    console.log('🎉 All deep link tests completed!');
  }

  private async testSingleLink(link: string, index: number): Promise<void> {
    try {
      console.log(`\n🧪 Test ${index + 1}/${this.testLinks.length}: ${link}`);
      
      const canOpen = await deepLinkingService.canOpenURL(link);
      
      if (canOpen) {
        console.log(`✅ SUCCESS: Can open "${link}"`);
      } else {
        console.log(`❌ FAILED: Cannot open "${link}"`);
      }
      
      // Delay antara tests
      if (index < this.testLinks.length - 1) {
        await this.delay(300);
      }
      
    } catch (error) {
      console.error(`💥 ERROR testing "${link}":`, error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test specific link
  async testLink(link: string): Promise<boolean> {
    try {
      return await deepLinkingService.canOpenURL(link);
    } catch (error) {
      console.error(`Error testing link ${link}:`, error);
      return false;
    }
  }

  // Generate test report
  async generateTestReport(): Promise<{ passed: number; failed: number; total: number }> {
    const results = await Promise.all(
      this.testLinks.map(async (link) => {
        const canOpen = await this.testLink(link);
        return { link, success: canOpen };
      })
    );

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 DEEP LINK TEST REPORT:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total: ${results.length}`);
    
    results.forEach(result => {
      console.log(`   ${result.success ? '✅' : '❌'} ${result.link}`);
    });

    return { passed, failed, total: results.length };
  }
}

export const deepLinkTester = new DeepLinkTester();

// Convenience function
export const testDeepLinks = () => deepLinkTester.runAllTests();