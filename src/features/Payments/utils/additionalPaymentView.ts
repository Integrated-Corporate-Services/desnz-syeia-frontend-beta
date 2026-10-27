import { AdditionalPaymentRequest } from '../../../services/additionalPaymentsService';
import { ADDITIONAL_PAYMENT_TITLES } from '../constants/additionalPayments';

type ViewState = {
  loading: boolean; payment: AdditionalPaymentRequest | null; pending: boolean; generating: boolean; step: string;
};

export function additionalPaymentView({ loading, payment, pending, generating, step }: ViewState) {
  if (loading) return { view: 'loading', title: step === 'result' ? ADDITIONAL_PAYMENT_TITLES.checking : ADDITIONAL_PAYMENT_TITLES.loading } as const;
  if (!payment) return { view: 'unavailable', title: ADDITIONAL_PAYMENT_TITLES.required } as const;
  if (payment.status === 'WITHDRAWN') return { view: 'withdrawn', title: ADDITIONAL_PAYMENT_TITLES.withdrawn } as const;
  if (pending) return { view: 'pending', title: ADDITIONAL_PAYMENT_TITLES.pending } as const;
  if (payment.status === 'PAID' || payment.status === 'PROCESSING') return {
    view: 'receipt', title: payment.status === 'PAID' ? ADDITIONAL_PAYMENT_TITLES.paid : ADDITIONAL_PAYMENT_TITLES.processing,
  } as const;
  if (generating) return { view: 'generating', title: ADDITIONAL_PAYMENT_TITLES.generating } as const;
  switch (step) {
    case 'invoice':
    case 'payment-method':
    case 'result':
    case 'bank-transfer':
    case 'proof': return { view: step, title: ADDITIONAL_PAYMENT_TITLES[step] };
    case 'processing': return { view: 'unconfirmed', title: ADDITIONAL_PAYMENT_TITLES.unconfirmed } as const;
    default: return { view: 'required', title: ADDITIONAL_PAYMENT_TITLES.required } as const;
  }
}