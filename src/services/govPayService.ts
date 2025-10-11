export async function createPayment(
  amount: number,
  applicationId: string,
  description: string,
  kind?: string,
  returnUrl?: string,
  userId?: string
) {
  const apiUrl = import.meta.env.VITE_GOVPAY_API_URL;
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, applicationId, description, reference: applicationId, kind, returnUrl, userId }),
  });
  if (!res.ok) throw new Error('Payment creation failed');
  return await res.json();
}


export async function getPaymentStatus(paymentId: string) {
  const apiUrl = import.meta.env.VITE_GOVPAY_API_URL;
  const res = await fetch(`${apiUrl}/${paymentId}/status`);
  if (!res.ok) throw new Error('Failed to fetch payment status');
  return await res.json();
}
