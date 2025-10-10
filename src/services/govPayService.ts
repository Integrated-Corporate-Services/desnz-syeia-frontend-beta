export async function createPayment(amount: number, reference: string, description: string) {
  const res = await fetch(import.meta.env.VITE_GOVPAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, reference, description }),
  });
  if (!res.ok) throw new Error('Payment creation failed');
  return await res.json();
}
