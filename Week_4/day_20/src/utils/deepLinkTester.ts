// src/utils/deepLinkTester.ts (UPDATE)

import { authService } from "../services/authService";
import { deepLinkingService } from "../services/deeplinkingServices";

class DeepLinkTester {
  private testLinks = [
    'ecommerceapp://home',
    'ecommerceapp://produk/123',
    'ecommerceapp://keranjang',
    'ecommerceapp://checkout',
    'ecommerceapp://profil/user123',
    'ecommerceapp://statistik',
    'https://ecommerceapp.com/home',
    'https://ecommerceapp.com/produk/456',
  ];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Deep Link Tests...');
    
    // Test auth status
    const isLoggedIn = await authService.isUserLoggedIn();
    console.log(`🔐 Current auth status: ${isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
    
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
        
        // Test tambahan untuk protected routes
        if (deepLinkingService.isProtectedRoute(link)) {
          const isLoggedIn = await authService.isUserLoggedIn();
          console.log(`🔐 Protected Route: ${isLoggedIn ? 'ACCESS GRANTED' : 'ACCESS DENIED - Login required'}`);
        }
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

  // Test protected route behavior
  async testProtectedRouteAccess(link: string): Promise<{ canOpen: boolean; requiresAuth: boolean; hasAccess: boolean }> {
    try {
      const canOpen = await this.testLink(link);
      const requiresAuth = deepLinkingService.isProtectedRoute(link);
      const hasAccess = requiresAuth ? await authService.isUserLoggedIn() : true;
      
      return { canOpen, requiresAuth, hasAccess };
    } catch (error) {
      console.error(`Error testing protected route ${link}:`, error);
      return { canOpen: false, requiresAuth: false, hasAccess: false };
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
    
    // Test protected routes secara khusus
    console.log('\n🔐 PROTECTED ROUTES TEST:');
    const protectedLinks = this.testLinks.filter(link => 
      deepLinkingService.isProtectedRoute(link)
    );
    
    for (const link of protectedLinks) {
      const { canOpen, requiresAuth, hasAccess } = await this.testProtectedRouteAccess(link);
      console.log(`   ${canOpen ? '✅' : '❌'} ${link}`);
      console.log(`     → Requires Auth: ${requiresAuth}`);
      console.log(`     → Has Access: ${hasAccess}`);
    }

    return { passed, failed, total: results.length };
  }
}

export const deepLinkTester = new DeepLinkTester();

// Convenience function
export const testDeepLinks = () => deepLinkTester.runAllTests();