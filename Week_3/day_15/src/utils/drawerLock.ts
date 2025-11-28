import React from 'react';

type DrawerLockContextType = {
  locked: boolean;
  setLocked: (locked: boolean) => void;
};

export const DrawerLockContext = React.createContext<DrawerLockContextType>({
  locked: false,
  setLocked: () => {},
});