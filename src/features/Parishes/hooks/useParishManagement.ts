import { useState, useCallback } from "react";
import { Parish } from "../types/Parish";

export const useParishManagement = () => {
  const [parishes, setParishes] = useState<Parish[]>([]);

  const addParish = useCallback((parish: Parish) => {
    setParishes((current) => {
      if (current.find((p) => p.id === parish.id)) {
        return current;
      }
      return [...current, parish];
    });
  }, []);

  const removeParish = useCallback((parishId: string) => {
    setParishes((current) => current.filter((p) => p.id !== parishId));
  }, []);

  return {
    parishes,
    addParish,
    removeParish,
  };
};
