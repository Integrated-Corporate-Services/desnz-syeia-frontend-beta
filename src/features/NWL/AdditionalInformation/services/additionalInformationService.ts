import axios from 'axios';
import { AdditionalInformationData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Update additional information data for an application
 */
export const updateAdditionalInformationData = async (
  applicationId: string,
  data: Partial<AdditionalInformationData>
): Promise<void> => {
  await axios.patch(
    `${API_BASE_URL}/applications/${applicationId}/additional-information`,
    data
  );
};
