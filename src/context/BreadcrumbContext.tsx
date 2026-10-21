import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SetBreadcrumb = (node: ReactNode) => void;


const BreadcrumbValueContext = createContext<ReactNode | undefined>(undefined);
const BreadcrumbSetterContext = createContext<SetBreadcrumb | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [breadcrumb, setBreadcrumb] = useState<ReactNode>(null);

  return (
    <BreadcrumbSetterContext.Provider value={setBreadcrumb}>
      <BreadcrumbValueContext.Provider value={breadcrumb}>
        {children}
      </BreadcrumbValueContext.Provider>
    </BreadcrumbSetterContext.Provider>
  );
};

const useSetBreadcrumb = (): SetBreadcrumb => {
  const setBreadcrumb = useContext(BreadcrumbSetterContext);
  if (!setBreadcrumb) {
    throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
  }
  return setBreadcrumb;
};

export const useBreadcrumbContext = () => {
  const breadcrumb = useContext(BreadcrumbValueContext);
  const setBreadcrumb = useSetBreadcrumb();
  return { breadcrumb, setBreadcrumb };
};

export const useBreadcrumb = (node: ReactNode) => {
  const setBreadcrumb = useSetBreadcrumb();

  useEffect(() => {
    setBreadcrumb(node);
    return () => setBreadcrumb(null);
  }, [node]);
};
