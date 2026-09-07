import { useState } from 'react';

const storageKey = (applicationId: string, requestId: string) =>
  `fir-selected-categories:${applicationId}:${requestId}`;

export const useFirSelectedCategories = (applicationId?: string, requestId?: string) => {
  const key = applicationId && requestId ? storageKey(applicationId, requestId) : '';
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (!key) return [];
    try {
      return JSON.parse(sessionStorage.getItem(key) || '[]') as string[];
    } catch {
      return [];
    }
  });

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
