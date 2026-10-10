import { useParams } from 'react-router-dom';

export const useCpoApplicationId = () => useParams().applicationId ?? '';
