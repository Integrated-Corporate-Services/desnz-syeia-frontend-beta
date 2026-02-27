import log from '../logger';

export const createPayment = async (
  amount: number,
  reference: string,
  description: string,
  returnUrl: string,
  metadata?: any
) => {
  try {
    // Validate applicationId before sending
    if (!metadata?.applicationId) {
      log.error('[createPayment] applicationId is required in metadata');
      throw new Error('applicationId is required in metadata');
    }

    const applicationId = metadata.applicationId; 

    const payload = {
      amount,
      reference,
      description,
      return_url: returnUrl,
      applicationId, // Explicitly include at root level
      userId: metadata.userId, // Explicitly include at root level
      metadata
    };

    log.debug('[createPayment] Creating payment', { applicationId, amount, reference });

    const response = await fetch(`/backend/api/gov-pay/applications/${applicationId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      log.error('[createPayment] Payment creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create payment');
    }

    log.info('[createPayment] Payment created successfully');
    return await response.json();
  } catch (error) {
    log.error('[createPayment] Error creating payment:', error);
    throw error;
  }
};

export const getPaymentStatus = async (applicationId: string, paymentId: string) => {
  try {
    log.debug('[getPaymentStatus] Fetching payment status', { applicationId, paymentId });
    const response = await fetch(`/backend/api/gov-pay/applications/${applicationId}/payments/${paymentId}/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      log.error('[getPaymentStatus] Failed to get payment status');
      throw new Error('Failed to get payment status');
    }

    return await response.json();
  } catch (error) {
    log.error('[getPaymentStatus] Error getting payment status:', error);
    throw error;
  }
};