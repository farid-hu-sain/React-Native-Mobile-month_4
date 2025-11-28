import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserStatsContextType {
  visitedScreens: string[];
  addVisitedScreen: (screenName: string) => void;
  getStats: () => { totalScreens: number; screens: string[] };
  clearStats: () => void;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const UserStatsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [visitedScreens, setVisitedScreens] = useState<string[]>([]);

  const addVisitedScreen = (screenName: string) => {
    setVisitedScreens(prev => {
      // Tambahkan timestamp untuk riwayat yang lebih detail
      const screenWithTime = `${screenName} - ${new Date().toLocaleTimeString('id-ID')}`;
      return [...prev, screenWithTime];
    });
  };

  const getStats = () => ({
    totalScreens: visitedScreens.length,
    screens: visitedScreens
  });

  const clearStats = () => {
    setVisitedScreens([]);
  };

  return (
    <UserStatsContext.Provider value={{
      visitedScreens,
      addVisitedScreen,
      getStats,
      clearStats
    }}>
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};