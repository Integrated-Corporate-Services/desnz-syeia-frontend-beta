import { useEffect, useState } from 'react';

const storageKey = (applicationId: string, requestId: string) =>
  `fir-selected-categories:${applicationId}:${requestId}`;

export const useFirSelectedCategories = (applicationId?: string, requestId?: string) => {
  const key = applicationId && requestId ? storageKey(applicationId, requestId) : '';
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!key) {
      setSelectedCategories([]);
      return;
    }
    try {
      const stored = JSON.parse(sessionStorage.getItem(key) || '[]');
      setSelectedCategories(Array.isArray(stored) ? stored : []);
    } catch {
      setSelectedCategories([]);
    }
  }, [key]);

  const saveSelectedCategories = (categories: string[]) => {
    setSelectedCategories(categories);
    if (key) sessionStorage.setItem(key, JSON.stringify(categories));
  };

  const clearSelectedCategories = () => {
    setSelectedCategories([]);
    if (key) sessionStorage.removeItem(key);
  };

  return { selectedCategories, saveSelectedCategories, clearSelectedCategories };
};
