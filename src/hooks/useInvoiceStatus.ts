import { useEffect, useState } from 'react';
import { buildBackendUrl } from '../utils/apiConfig';

export interface InvoiceStatus {
    invoiceExists: boolean;
    invoiceNumber?: string;
}

export const buildInvoiceDownloadUrl = (applicationId: string, invoiceNumber: string): string =>
    buildBackendUrl(`/api/invoice/${applicationId}/download?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);

export const useInvoiceStatus = (applicationId?: string): InvoiceStatus | null => {
    const [status, setStatus] = useState<InvoiceStatus | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setStatus(null);
            return;
        }

        let cancelled = false;
        setStatus(null);

        fetch(buildBackendUrl(`/api/invoice/${applicationId}/status`), { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : { invoiceExists: false }))
            .then((data) => {
                if (!cancelled) setStatus(data);
            })
            .catch(() => {
                if (!cancelled) setStatus({ invoiceExists: false });
            });

        return () => {
            cancelled = true;
        };
    }, [applicationId]);

    return status;
};
