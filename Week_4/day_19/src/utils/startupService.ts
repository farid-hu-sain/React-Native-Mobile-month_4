// src/utils/startupService.ts - NEW FILE
import { storageService } from '../services/storageService';

export interface StartupResult {
  success: boolean;
  storageHealth: any;
  errors: string[];
  timestamp: string;
}

export class StartupService {
  static async initializeApp(): Promise<StartupResult> {
    const results: StartupResult = {
      success: true,
      storageHealth: null,
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      console.log('🚀 Starting comprehensive app initialization...');
      
      // 1. Check and repair storage corruption
      console.log('🔍 Phase 1: Storage health check...');
      const healthCheck = await storageService.detectAndRepairCorruption();
      results.storageHealth = healthCheck;
      
      if (healthCheck.corruptedItems > 0) {
        console.warn(`⚠️ Found ${healthCheck.corruptedItems} corrupted items during startup`);
        results.errors.push(`Found ${healthCheck.corruptedItems} corrupted storage items`);
        
        if (healthCheck.repairedItems > 0) {
          console.log(`✅ Repaired ${healthCheck.repairedItems} items automatically`);
        }
      } else {
        console.log('✅ No storage corruption detected');
      }
      
      // 2. Check storage usage
      console.log('💾 Phase 2: Storage usage check...');
      const storageUsage = await storageService.getStorageUsage();
      console.log(`📊 Storage usage: ${(storageUsage / 1024).toFixed(2)} KB`);
      
      if (storageUsage > 5 * 1024 * 1024) { // 5MB threshold
        console.warn('⚠️ High storage usage detected');
        results.errors.push('High storage usage detected');
      }
      
      // 3. Get final storage health status
      console.log('📋 Phase 3: Final health assessment...');
      const finalHealth = await storageService.getStorageHealth();
      console.log(`🏥 Final storage health: ${finalHealth.status}`);
      
      if (finalHealth.status === 'corrupted') {
        results.errors.push('Storage corruption detected after repair attempts');
      }
      
      console.log('✅ Comprehensive app initialization completed');
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      results.success = false;
      results.errors.push(`Startup failed: ${error.message}`);
    }
    
    return results;
  }

  static async getStartupSummary(): Promise<{
    storageStatus: string;
    corruptedItems: number;
    repairedItems: number;
    totalErrors: number;
  }> {
    try {
      const health = await storageService.getStorageHealth();
      const logs = await storageService['getCorruptionLogs']();
      
      return {
        storageStatus: health.status,
        corruptedItems: health.corruptionCount,
        repairedItems: logs.filter((log: any) => log.repaired).length,
        totalErrors: logs.length
      };
    } catch (error) {
      console.error('Error getting startup summary:', error);
      return {
        storageStatus: 'unknown',
        corruptedItems: 0,
        repairedItems: 0,
        totalErrors: 0
      };
    }
  }
}