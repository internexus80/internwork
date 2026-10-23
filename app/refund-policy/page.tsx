import type { Metadata } from 'next';
import { InfoSection, PublicInfoLayout } from '@/components/common/PublicInfoLayout';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Review the certificate fee, payment issue, duplicate charge and cancellation process for InternJourneys.',
  alternates: {
    canonical: '/refund-policy',
  },
  openGraph: {
    title: 'Refund & Cancellation Policy',
    description: 'Review the certificate fee, payment issue, duplicate charge and cancellation process for InternJourneys.',
    url: '/refund-policy',
  },
  twitter: {
    title: 'Refund & Cancellation Policy',
    description: 'Review the certificate fee, payment issue, duplicate charge and cancellation process for InternJourneys.',
  },
};

export default function RefundPolicyPage() {
  return (
    <PublicInfoLayout
      title="Refund & Cancellation Policy"
      description="This policy explains the ₹199 certificate fee and how to report duplicate, failed, pending or otherwise disputed payments."
      updatedAt="2 June 2026"
    >
      <InfoSection title="1. Certificate fee and eligibility">
        <p>The certificate processing fee is ₹199 INR and is shown before checkout. Students must complete all required internship tasks and have a successful payment verified by the payment provider and InternJourneys before the certificate is issued. A pending payment or browser checkout message alone does not establish eligibility.</p>
      </InfoSection>

      <InfoSection title="2. Suspected duplicate payments">
        <p>If you believe you were charged more than once for the same certificate fee, email <a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a> with your account email, order or transaction reference, and a brief description. We will compare the platform and provider records. Eligible duplicate charges will be corrected or refunded in accordance with applicable law and payment-provider procedures.</p>
      </InfoSection>

      <InfoSection title="3. Failed, pending or interrupted payments">
        <p>If money appears to have been debited but the payment is pending, unsuccessful or the checkout was interrupted, contact support with your account email and transaction reference. We will check the payment status with Cashfree before determining the next step. Do not send card PINs, passwords, OTPs or other payment credentials.</p>
      </InfoSection>

      <InfoSection title="4. Successful payment but certificate unavailable">
        <p>If the payment is confirmed but your certificate is unavailable after all required tasks are complete, contact support with your account email, order/payment reference and internship domain. We will review the payment and eligibility records and help resolve any discrepancy.</p>
      </InfoSection>

      <InfoSection title="5. Cancellation requests">
        <p><strong>Account cancellation:</strong> Contact support to request account closure or deletion. Some records may need to be retained where required by law or for legitimate transaction, security or dispute-handling purposes.</p>
        <p><strong>Internship cancellation:</strong> Contact support with your account email and domain if you wish to stop participating. Stopping an internship does not by itself mean a payment is refundable.</p>
        <p><strong>Payment refund:</strong> Refund requests are reviewed based on provider records, the circumstances of the transaction, applicable law and payment-provider procedures. This policy does not promise an automatic refund for every request and does not exclude corrections or remedies required by law.</p>
      </InfoSection>

      <InfoSection title="6. How to contact us">
        <p>Email <a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a>. Include the account email, order/payment reference, date and a concise explanation. Do not include passwords, card numbers, PINs or OTPs. No fixed response or refund-processing timeframe is stated here.</p>
      </InfoSection>
    </PublicInfoLayout>
  );
}
