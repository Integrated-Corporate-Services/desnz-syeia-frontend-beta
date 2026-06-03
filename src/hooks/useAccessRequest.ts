import { useState, useCallback } from 'react';

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

export function useAccessRequest() {
  const [formData, setFormData] = useState<Partial<AccessRequestFormData>>({});

  const updateFormData = useCallback((data: Partial<AccessRequestFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const clearFormData = useCallback(() => {
    setFormData({});
  }, []);

  return {
    formData,
    updateFormData,
    clearFormData,
  };
}
