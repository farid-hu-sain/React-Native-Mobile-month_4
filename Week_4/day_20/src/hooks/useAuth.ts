// src/hooks/useAuth.ts (FILE BARU)
import { useAuth } from '../context/AuthContext';

// Re-export dari context untuk kemudahan penggunaan
export { useAuth };

// Custom hook tambahan untuk token management
export const useTokenManagement = () => {
  const { user, isAuthenticated, tokenRemainingTime } = useAuth();
  
  const getTokenStatus = () => {
    if (!isAuthenticated) return 'not_authenticated';
    if (tokenRemainingTime === 'Expired') return 'expired';
    return 'valid';
  };
  
  const isTokenExpired = () => {
    return getTokenStatus() === 'expired';
  };
  
  const isTokenValid = () => {
    return getTokenStatus() === 'valid';
  };
  
  return {
    tokenStatus: getTokenStatus(),
    isTokenExpired: isTokenExpired(),
    isTokenValid: isTokenValid(),
    remainingTime: tokenRemainingTime,
    hasToken: isAuthenticated
  };
};