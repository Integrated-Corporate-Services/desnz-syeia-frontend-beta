import React from 'react';
import { useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useInvoiceStatus, buildInvoiceDownloadUrl } from '../../../hooks';
import { FirSummaryCard } from '../../FIR/FirSummaryCard';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import { WithdrawalRequest } from '../types';
import { SummaryWithdrawButton } from './SummaryWithdrawButton';

interface S37ApplicationSummaryContentProps {
    data: ApplicationReviewSummaryData;
    applicationId: string;
    withdrawalRequest: WithdrawalRequest | null;
}

const formatAmount = (payment: ApplicationReviewSummaryData['payment']): string => {
    if (!payment) return '-';
    if (payment.total_amount) return payment.total_amount;
    if (typeof payment.amount === 'number') return `£${(payment.amount / 100).toFixed(2)}`;
    return '-';
};

export const S37ApplicationSummaryContent: React.FC<S37ApplicationSummaryContentProps> = ({
    data,
    applicationId,
    withdrawalRequest,
}) => {
    const navigate = useNavigate();
    const invoiceStatus = useInvoiceStatus(applicationId);
    const payment = data.payment;

    const summaryRows: SummaryRow[] = [
        { key: { text: 'DESNZ reference' }, value: { text: data.desnzRef || '-' } },
        { key: { text: 'Case type' }, value: { text: 'Overhead lines (S37)' } },
        {
            key: { text: 'Application status' },
            value: {
                text: '',
                reactElement: data.status ? <StatusBadge status={data.status} /> : '-',
            },
        },
    ];

    if (withdrawalRequest) {
        summaryRows.push({
            key: { text: 'Withdrawal request' },
            value: { text: withdrawalRequest.request_status },
        });
    }

    const paymentRows: SummaryRow[] = [
        {
            key: { text: 'Payment reference number' },
            value: { text: payment?.reference || payment?.payment_id || '[System-generated UNIQUE NUMBER]' },
        },
        {
            key: { text: 'Invoice' },
            value: invoiceStatus?.invoiceExists && invoiceStatus.invoiceNumber
                ? {
                    text: '',
                    reactElement: (
                        <a className="govuk-link" href={buildInvoiceDownloadUrl(applicationId, invoiceStatus.invoiceNumber)}>
                            {invoiceStatus.invoiceNumber}
                        </a>
                    ),
                }
                : { text: '-' },
        },
        { key: { text: 'Total amount' }, value: { text: formatAmount(payment) } },
    ];

    return (
        <>
            <h1 className="govuk-heading-l">Application summary</h1>

            {/* FirSummaryCard fetches its own FIR history and renders null when there is none,
                so it must not be gated on the *current* status (a completed FIR should still
                be reachable via "View all information requests" after status moves on). */}
            <FirSummaryCard
                applicationId={applicationId}
                basePath={`${S37_BASE_URL}/${applicationId}/further-information-requests`}
            />

            <SummaryCard title="Summary" rows={summaryRows} />

            {payment && <SummaryCard title="Payment details" rows={paymentRows} />}

            {data.permissions.canWithdraw && !data.permissions.canEdit && !withdrawalRequest && (
                <div className="govuk-button-group govuk-!-margin-top-6">
                    <SummaryWithdrawButton
                        onClick={() => navigate(`${S37_BASE_URL}/${applicationId}/withdraw`, {
                            state: { desnzRef: data.desnzRef, formType: 'S37' },
                        })}
                    />
                </div>
            )}
        </>
    );
};