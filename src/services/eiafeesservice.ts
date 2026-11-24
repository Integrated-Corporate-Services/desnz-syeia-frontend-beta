// src/services/eiafeesservice.ts

import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';

// EIA Fees type
import { EiaFees } from '../types/eiaFees';
import log from '../logger';

const EIA_SCREENING_VOLTAGE_KV = 132;

// Payload for creating EIA Fee
export interface CreateEiaFeePayload {
  eiaId: string;
  applicationId: string;
  isEiaDevelopment: boolean;
  screeningOnly: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Payload for updating EIA Fee
export interface UpdateEiaFeePayload {
  eiaFeeId: string;
  applicationId: string;
  isEiaDevelopment: boolean;
  screeningOnly: boolean;
  updatedAt: string;
  updatedBy: string;
}

// Service to fetch EIA Fees details from the backend
export const fetchEiaFeesDetails = async (applicationId: string): Promise<EiaFees> => {
  try {
    log.debug('[fetchEiaFeesDetails] Fetching EIA Fees details', { applicationId });
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/eia-fees`), {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch EIA Fees details');
    const data = await response.json();
    // If backend returns { applicationId, eiaFees: [ ... ] }, flatten to first eiaFees item
    if (data && Array.isArray(data.eiaFees)) {
      return {
        ...data.eiaFees[0],
        applicationId: data.applicationId,
        uploadedFiles: data.uploadedFiles ?? [],
        applicationDocuments: data.applicationDocuments ?? [],
      };
    }
    // If backend returns a flat object, just return it
    return data;
  } catch (error) {
    log.error('[fetchEiaFeesDetails] Error fetching EIA Fees details:', error);
    throw error;
  }
};

export interface EiaScreeningRequirement {
  highVoltage: boolean;
  sensitiveArea: boolean;
}

// SYEIA-1485: screening is mandatory for a line of 132kV or higher, or a route through a chargeable sensitive area.
export const fetchEiaScreeningRequirement = async (applicationId: string): Promise<EiaScreeningRequirement> => {
  const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/fees`), { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch EIA screening requirement');
  const { breakdown } = await response.json();
  return {
    highVoltage: (breakdown?.voltageValue ?? 0) >= EIA_SCREENING_VOLTAGE_KV,
    sensitiveArea: breakdown?.hasChargeableSensitiveArea === true,
  };
};

// Service to create EIA Fee via POST
export const createEiaFee = async (payload: CreateEiaFeePayload): Promise<EiaFees> => {
  const response = await fetch(buildBackendUrl('/api/applications/eia-fees'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create EIA Fee');
  }
  return response.json();
};

// Service to update EIA Fee via PUT
export const updateEiaFee = async (payload: UpdateEiaFeePayload): Promise<EiaFees> => {
  const response = await fetch(buildBackendUrl('/api/applications/eia-fees'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update EIA Fee');
  }
  return response.json();
};
