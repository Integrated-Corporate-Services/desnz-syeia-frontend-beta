import { buildBackendUrl } from '../../../utils/apiConfig';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';

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


export async function fetchPaymentProofDocuments(applicationId: string): Promise<{
  uploadedFiles: UploadedFile[];
  applicationDocuments: ApplicationDocument[];
}> {
  const response = await fetch(buildBackendUrl(`/api/application/${applicationId}/payment-proof-documents`), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment proof documents (HTTP ${response.status})`);
  }

  const result = await response.json();
  return {
    uploadedFiles: Array.isArray(result.uploadedFiles) ? result.uploadedFiles : [],
    applicationDocuments: Array.isArray(result.applicationDocuments) ? result.applicationDocuments : [],
  };
}
