import { buildBackendUrl } from '../../../utils/apiConfig';

export async function fetchInvoiceNumber(applicationId: string): Promise<string | null> {
  const response = await fetch(buildBackendUrl(`/api/invoice/${applicationId}/status`), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  if (result.invoiceExists && typeof result.invoiceNumber === 'string' && result.invoiceNumber) {
    return result.invoiceNumber;
  }

  return null;
}

export async function fetchFeeTotal(applicationId: string): Promise<number | null> {
  const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/fees`), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  if (typeof result.totalAmount === 'number' && result.totalAmount > 0) {
    return result.totalAmount;
  }

  return null;
}
