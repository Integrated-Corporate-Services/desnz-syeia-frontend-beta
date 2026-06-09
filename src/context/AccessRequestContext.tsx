import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('AccessRequestContext');

export interface AccessRequestFormData {
  email: string;
  title?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postCode: string;
  isAgent?: boolean;
  agencyName?: string;
  organisationIds: string[];
}

interface AccessRequestContextType {
  formData: Partial<AccessRequestFormData>;
  updateFormData: (data: Partial<AccessRequestFormData>) => void;
  clearFormData: () => void;
}

const ACCESS_REQUEST_STORAGE_KEY = 'accessRequestFormData';

const AccessRequestContext = createContext<AccessRequestContextType | undefined>(undefined);

export const AccessRequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from sessionStorage to persist across page refreshes
  const [formData, setFormData] = useState<Partial<AccessRequestFormData>>(() => {
    try {
      const stored = sessionStorage.getItem(ACCESS_REQUEST_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      logger.debug('Loaded from sessionStorage:', Object.keys(parsed).length > 0 ? 'Found data' : 'No data');
      return parsed;
    } catch (error) {
      logger.error('Failed to load from sessionStorage:', error);
      return {};
    }
  });

  // Persist to sessionStorage whenever formData changes
  useEffect(() => {
    try {
      if (Object.keys(formData).length > 0) {
        sessionStorage.setItem(ACCESS_REQUEST_STORAGE_KEY, JSON.stringify(formData));
        logger.debug('Saved to sessionStorage:', Object.keys(formData));
      } else {
        sessionStorage.removeItem(ACCESS_REQUEST_STORAGE_KEY);
        logger.debug('Cleared sessionStorage');
      }
    } catch (error) {
      logger.error('Failed to save to sessionStorage:', error);
    }
  }, [formData]);

  const updateFormData = useCallback((data: Partial<AccessRequestFormData>) => {
    logger.debug('Updating formData:', Object.keys(data));
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const clearFormData = useCallback(() => {
    logger.debug('Clearing all form data');
    setFormData({});
    try {
      sessionStorage.removeItem(ACCESS_REQUEST_STORAGE_KEY);
    } catch (error) {
      logger.error('Failed to clear sessionStorage:', error);
    }
  }, []);

  return (
    <AccessRequestContext.Provider value={{ formData, updateFormData, clearFormData }}>
      {children}
    </AccessRequestContext.Provider>
  );
};

export const useAccessRequestContext = () => {
  const context = useContext(AccessRequestContext);
  if (!context) {
    throw new Error('useAccessRequestContext must be used within AccessRequestProvider');
  }
  return context;
};
