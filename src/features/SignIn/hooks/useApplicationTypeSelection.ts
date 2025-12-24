import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/applicationTypeOptions';

interface UseApplicationTypeSelectionReturn {
  selectedType: string;
  error: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: Array<{ fieldId: string; message: string }>;
}

export const useApplicationTypeSelection = (): UseApplicationTypeSelectionReturn => {
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(e.target.value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedType) {
      setError('Select an application type');
      return;
    }

    const route = ROUTES[selectedType as keyof typeof ROUTES];
    if (route) {
      navigate(route);
    }
  };

  const errors = error ? [{ fieldId: 'applicationType', message: error }] : [];

  return {
    selectedType,
    error,
    handleChange,
    handleSubmit,
    errors,
  };
};
