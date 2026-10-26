import { useParams } from 'react-router-dom';

export const useCpoApplicationId = () => {
  const params = useParams();

  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  };

  return getApplicationId();
};

export const useApplicationId = useCpoApplicationId;
