import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface BreadcrumbContextType {
  breadcrumb: ReactNode;
  setBreadcrumb: (node: ReactNode) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [breadcrumb, setBreadcrumb] = useState<ReactNode>(null);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbContext must be used within BreadcrumbProvider');
  }
  return context;
};

export const useBreadcrumb = (node: ReactNode) => {
  const { setBreadcrumb } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumb(node);
    return () => setBreadcrumb(null);
  }, [node]);
};
