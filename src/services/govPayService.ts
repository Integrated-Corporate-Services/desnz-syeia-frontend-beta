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
      throw new Error('applicationId is required in metadata');
    }

    const payload = {
      amount,
      reference,
      description,
      return_url: returnUrl,
      applicationId: metadata.applicationId, // Explicitly include at root level
      userId: metadata.userId, // Explicitly include at root level
      metadata
    };

    console.log('Creating payment with payload:', payload);

    const response = await fetch('/backend/api/gov-pay/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const getPaymentStatus = async (paymentId: string) => {
  try {
    const response = await fetch(`/backend/api/gov-pay/${paymentId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};