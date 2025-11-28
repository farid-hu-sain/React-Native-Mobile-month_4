// src/utils/tokenValidator.ts (FILE BARU - Pure TypeScript/React Native)
import { authService } from '../services/authService';
import { authUtils } from './auth';

// Type untuk interval ID (platform agnostic)
type IntervalId = number;

export const TokenValidator = {
  // Periodic token validation
  startTokenValidation(navigation: any, interval: number = 300000): IntervalId {
    console.log(`🔄 Starting token validation every ${interval / 1000} seconds`);
    
    const intervalId = setInterval(async () => {
      try {
        const isLoggedIn = await authService.isUserLoggedIn();
        
        if (!isLoggedIn) {
          console.log('❌ Token expired detected by periodic check, redirecting to login...');
          // Token expired, redirect to login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (error) {
        console.error('❌ Periodic token validation error:', error);
      }
    }, interval);

    return intervalId;
  },

  stopTokenValidation(intervalId: IntervalId): void {
    console.log('🛑 Stopping token validation');
    clearInterval(intervalId);
  },

  // Manual token validation
  async manualTokenCheck(): Promise<boolean> {
    return await authService.isUserLoggedIn();
  },

  // Validasi token dengan callback
  async validateTokenWithCallback(
    onValid: () => void, 
    onInvalid: () => void
  ): Promise<void> {
    try {
      const isValid = await authService.isUserLoggedIn();
      
      if (isValid) {
        onValid();
      } else {
        onInvalid();
      }
    } catch (error) {
      console.error('❌ Token validation with callback error:', error);
      onInvalid();
    }
  },

  // Setup token validation untuk screen
  setupScreenTokenValidation(navigation: any) {
    let intervalId: IntervalId | null = null;
    
    const startValidation = () => {
      intervalId = this.startTokenValidation(navigation);
    };
    
    const stopValidation = () => {
      if (intervalId) {
        this.stopTokenValidation(intervalId);
        intervalId = null;
      }
    };
    
    return {
      start: startValidation,
      stop: stopValidation
    };
  },

  // Validasi token sekali saat screen focus
  async validateOnScreenFocus(navigation: any): Promise<boolean> {
    try {
      const isLoggedIn = await authService.isUserLoggedIn();
      
      if (!isLoggedIn) {
        console.log('❌ Token expired on screen focus, redirecting to login...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Screen focus token validation error:', error);
      return false;
    }
  },

  // Get token status dengan detail
  async getTokenStatus(): Promise<{
    isValid: boolean;
    hasToken: boolean;
    isExpired: boolean;
    remainingTime?: string;
  }> {
    try {
      const hasToken = !!(await authService.getValidToken());
      const isValid = await authService.isUserLoggedIn();
      const isExpired = hasToken && !isValid;

      let remainingTime: string | undefined;
      if (hasToken && isValid) {
        remainingTime = await authUtils.getFormattedRemainingTime();
      }

      return {
        isValid,
        hasToken,
        isExpired,
        remainingTime
      };
    } catch (error) {
      console.error('❌ Get token status error:', error);
      return {
        isValid: false,
        hasToken: false,
        isExpired: false
      };
    }
  }
};