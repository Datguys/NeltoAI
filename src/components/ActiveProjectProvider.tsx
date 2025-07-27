import React from 'react';
import { ActiveProjectContext, useActiveProjectLogic } from '@/hooks/useActiveProject';

interface ActiveProjectProviderProps {
  children: React.ReactNode;
}

export function ActiveProjectProvider({ children }: ActiveProjectProviderProps) {
  const activeProjectLogic = useActiveProjectLogic();

  return (
    <ActiveProjectContext.Provider value={activeProjectLogic}>
      {children}
    </ActiveProjectContext.Provider>
  );
}