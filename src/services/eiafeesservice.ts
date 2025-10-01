// src/services/eiafeesservice.ts

// Service to fetch EIA Fees details from the backend
export const fetchEiaFeesDetails = async (applicationId: string) => {
  try {
    const response = await fetch(`/api/eia-fees?applicationId=${applicationId}`);
    if (!response.ok) throw new Error('Failed to fetch EIA Fees details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching EIA Fees details:', error);
    throw error;
  }
};

// Service to create EIA Fee via POST
export const createEiaFee = async (payload: any) => {
  // Accepts snake_case or camelCase, but always sends camelCase to backend
  const camelPayload = {
      eiaId: payload.eia_id || payload.eiaId,
      applicationId: payload.application_id || payload.applicationId,
      isEiaDevelopment: payload.is_eia_development ?? payload.isEiaDevelopment,
      requiresFullEia: payload.requires_full_eia ?? payload.requiresFullEia,
      screeningOnly: payload.screening_only ?? payload.screeningOnly,
      createdAt: payload.created_at || payload.createdAt,
      updatedAt: payload.updated_at || payload.updatedAt,
      createdBy: payload.created_by || payload.createdBy,
      updatedBy: payload.updated_by || payload.updatedBy,
  };
  const response = await fetch('/api/eia-fees', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(camelPayload),
  });
  if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create EIA Fee');
  }
  return response.json();
};

// Service to update EIA Fee via PUT
export const updateEiaFee = async (payload: any) => {
  const response = await fetch('/api/eia-fees', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update EIA Fee');
  }
  return response.json();
};
