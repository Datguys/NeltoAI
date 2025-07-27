import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type TemplateMode = 'classic-dashboard' | 'modern-landing' | 'minimal-projects';

interface TemplateContextProps {
  template: TemplateMode;
  setTemplate: (mode: TemplateMode) => void;
}

const TemplateContext = createContext<TemplateContextProps>({
  template: 'classic-dashboard',
  setTemplate: () => {},
});

export const useTemplate = () => useContext(TemplateContext);

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  const [template, setTemplate] = useState<TemplateMode>(() => {
    // Try to load from localStorage for persistence
    const stored = localStorage.getItem('template-mode');
    return (stored as TemplateMode) || 'classic-dashboard';
  });

  useEffect(() => {
    localStorage.setItem('template-mode', template);
  }, [template]);

  return (
    <TemplateContext.Provider value={{ template, setTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
};
