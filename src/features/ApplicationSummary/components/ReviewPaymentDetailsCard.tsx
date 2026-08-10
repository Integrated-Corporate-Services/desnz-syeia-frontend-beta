import React, { useEffect } from 'react';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { formatDate } from '../../NWL/CheckYourAnswers/utils';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { ReviewSummaryPayment } from '../types/reviewSummary';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { getCsrfHeaders } from '../../../utils/csrf';
import logger from '../../../logger';

const L = CONSTANTS.REVIEW_LAYOUT;

interface ReviewPaymentDetailsCardProps {
    payment: ReviewSummaryPayment | null;
    applicationId?: string;
    applicationType?: 'NWL' | 'S37';
    desnzRef?: string | null;
    applicationStatus?: string | null;
}

const formatAmount = (payment: ReviewSummaryPayment): string => {
    if (payment.total_amount) return payment.total_amount;
    if (typeof payment.amount === 'number') return `£${(payment.amount / 100).toFixed(2)}`;
    return L.DEFAULTS.NOT_AVAILABLE;
};

const formatMethod = (kind: string | null | undefined): string => {
    if (!kind) return L.DEFAULTS.NOT_AVAILABLE;
    return L.PAYMENT.METHODS[kind] || kind;
};

const downloadInvoiceWithFallback = async (
    s3Key: string,
    applicationId: string,
    applicationType: 'NWL' | 'S37'
): Promise<void> => {
    try {
        logger.info('[ReviewPaymentDetailsCard] Attempting to download invoice', { s3Key, applicationId });
        
        await downloadS3FileOnSameTab(s3Key, undefined, applicationId);
        logger.info('[ReviewPaymentDetailsCard] Invoice downloaded successfully from S3');
        
    } catch (downloadError) {
        logger.warn('[ReviewPaymentDetailsCard] Invoice not found in S3, attempting to generate', { 
            s3Key, 
            applicationId,
            error: downloadError 
        });
        
        try {
            const response = await fetch(
                buildBackendUrl(`/api/invoice/${applicationId}/generate`),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getCsrfHeaders(),
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        applicationId,
                        applicationType,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate invoice');
            }

            const result = await response.json();
            logger.info('[ReviewPaymentDetailsCard] Invoice generated successfully', { 
                invoiceNumber: result.invoiceNumber,
                s3Key: result.s3Key 
            });

            await downloadS3FileOnSameTab(result.s3Key || s3Key, undefined, applicationId);
            logger.info('[ReviewPaymentDetailsCard] Invoice downloaded successfully after generation');
            
        } catch (generateError) {
            logger.error('[ReviewPaymentDetailsCard] Failed to generate or download invoice', { 
                s3Key,
                applicationId,
                error: generateError 
            });
            throw generateError;
        }
    }
};

export const ReviewPaymentDetailsCard: React.FC<ReviewPaymentDetailsCardProps> = ({ 
    payment, 
    applicationId, 
    applicationType, 
    desnzRef,
    applicationStatus
}) => {
    if (!payment) {
        return null;
    }

    const isPaid = payment.is_successful || payment.status === 'success';
    const statusLabel = isPaid ? L.PAYMENT.STATUS_PAID : L.PAYMENT.STATUS_PENDING;

    const isProcessingPayment = applicationStatus?.toLowerCase().replace(/_/g, ' ').includes('processing payment') || false;

    let rows: SummaryRow[] = [];

    if (applicationType === 'NWL') {
        if (isProcessingPayment) {
            rows.push({
                key: { text: 'Transaction number' },
                value: { text: payment.transaction_number || L.DEFAULTS.NOT_AVAILABLE },
            });
        } else {
            rows.push({
                key: { text: L.PAYMENT.PAYMENT_REFERENCE },
                value: { text: applicationId || L.DEFAULTS.NOT_AVAILABLE },
            });
        }

        if (applicationId && (payment.invoice_number || desnzRef)) {
            const invoiceNumber = payment.invoice_number || `INV01/${desnzRef}.pdf`;
            const folderName = invoiceNumber.includes('/') ? invoiceNumber.split('/')[0] : 'INV01';
            const fileName = invoiceNumber.includes('/') ? invoiceNumber.split('/')[1] : invoiceNumber;
            const s3Key = `NWL/${applicationId}/invoice/${folderName}/${fileName}`;

            rows.push({
                key: { text: 'Invoice' },
                value: {
                    text: '',
                    html: `<a href="#" class="govuk-link invoice-download-link" data-s3-key="${s3Key}">${invoiceNumber}</a>`,
                },
            });
        }

        rows.push({
            key: { text: 'Total amount' },
            value: { text: formatAmount(payment) },
        });
    } else {
        if (isProcessingPayment) {
            rows.push({
                key: { text: 'Transaction number' },
                value: { text: payment.transaction_number || L.DEFAULTS.NOT_AVAILABLE },
            });
        } else {
            rows = [
                {
                    key: { text: L.PAYMENT.APPLICATION_FEE },
                    value: { text: formatAmount(payment) },
                },
            {
                key: { text: L.PAYMENT.PAYMENT_METHOD },
                value: { text: formatMethod(payment.kind) },
            },
            {
                key: { text: L.PAYMENT.PAYMENT_STATUS },
                value: { text: statusLabel },
            },
        ];

        if (payment.created_at) {
            rows.push({
                key: { text: L.PAYMENT.PAYMENT_DATE },
                value: { text: formatDate(payment.created_at) },
            });
        }

        if (payment.payment_id || payment.reference) {
            rows.push({
                key: { text: L.PAYMENT.PAYMENT_REFERENCE },
                value: { text: payment.payment_id || payment.reference || L.DEFAULTS.NOT_AVAILABLE },
            });
        }
    }

        if (applicationId && applicationType && (payment.invoice_number || desnzRef)) {
            const invoiceNumber = payment.invoice_number || `INV01/${desnzRef}.pdf`;
            const folderPrefix = 'Section-37';
            const folderName = invoiceNumber.includes('/') ? invoiceNumber.split('/')[0] : 'INV01';
            const fileName = invoiceNumber.includes('/') ? invoiceNumber.split('/')[1] : invoiceNumber;
            const s3Key = `${folderPrefix}/${applicationId}/invoice/${folderName}/${fileName}`;

            rows.push({
                key: { text: 'Invoice' },
                value: {
                    text: '',
                    html: `<a href="#" class="govuk-link invoice-download-link" data-s3-key="${s3Key}">${invoiceNumber}</a>`,
                },
            });
        }

        if (isProcessingPayment) {
            rows.push({
                key: { text: 'Total amount' },
                value: { text: formatAmount(payment) },
            });
        }
    }
    useEffect(() => {
        const invoiceLink = document.querySelector('.invoice-download-link') as HTMLAnchorElement;
        if (invoiceLink && applicationId && applicationType) {
            const handleClick = async (e: Event) => {
                e.preventDefault();
                const s3Key = invoiceLink.getAttribute('data-s3-key');
                if (s3Key) {
                    try {
                        await downloadInvoiceWithFallback(s3Key, applicationId, applicationType);
                    } catch (error) {
                        logger.error('[ReviewPaymentDetailsCard] Failed to download invoice:', error);
                       
                    }
                }
            };

            invoiceLink.addEventListener('click', handleClick);

            return () => {
                invoiceLink.removeEventListener('click', handleClick);
            };
        }
    }, [applicationId, applicationType, desnzRef]);

    return <SummaryCard title={L.PAYMENT.HEADING} rows={rows} />;
};
