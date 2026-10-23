import type { Metadata } from 'next';
import { InfoSection, PublicInfoLayout } from '@/components/common/PublicInfoLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn what personal information InternJourneys processes to provide online internships and certificate services.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy',
    description: 'Learn what personal information InternJourneys processes to provide online internships and certificate services.',
    url: '/privacy-policy',
  },
  twitter: {
    title: 'Privacy Policy',
    description: 'Learn what personal information InternJourneys processes to provide online internships and certificate services.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PublicInfoLayout
      title="Privacy Policy"
      description="This policy describes personal information used to operate InternJourneys virtual internships, task submissions, payments and certificate verification."
      updatedAt="2 June 2026"
    >
      <InfoSection title="1. Who is responsible">
        <p>InternJourneys, operated by proprietor VADIVEL BHUVANESH, is responsible for this service in Pudukkottai district, Tamil Nadu, India. For privacy questions or requests, email <a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a>.</p>
      </InfoSection>

      <InfoSection title="2. Information processed">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Account and identity:</strong> name, email address, authentication/account identifiers, and the phone number, college and graduation year supplied during registration. Supabase Auth manages authentication; the application also stores profile information in Supabase.</li>
          <li><strong>Learning activity:</strong> selected domain, enrollment and progress, task status, submitted links or text, and associated verification notes and timestamps.</li>
          <li><strong>Certificates:</strong> student and domain details, certificate identifier, issue and status information, and public verification details for issued certificates.</li>
          <li><strong>Payment records:</strong> amount, currency, purpose, provider, order/payment reference identifiers, status and relevant timestamps. Payment credentials are handled through the provider checkout; do not send PINs, passwords or one-time passcodes to InternJourneys.</li>
          <li><strong>Technical and operational information:</strong> Supabase session state is stored in browser session storage. Server logs may include operational events and error details. Upstash Redis is used to cache public internship-domain data. The inspected app code does not show a separate analytics or advertising tracker; hosting and service-provider logs may still be generated.</li>
        </ul>
      </InfoSection>

      <InfoSection title="3. Why we use this information">
        <p>Information is used to create and secure accounts, administer enrollments, deliver tasks, receive and review submissions, provide support, reconcile payments, determine certificate eligibility, issue certificates and respond to legal or security concerns. The relevant basis depends on the context and applicable law, including providing the service requested, consent where required, legitimate operational needs, and legal obligations.</p>
      </InfoSection>

      <InfoSection title="4. Service providers and sharing">
        <p>Supabase provides authentication, database and related application services. Cashfree processes checkout and payment transactions. Upstash Redis caches domain catalog responses. Information is shared with these providers only as needed for their service roles, and may be disclosed where required by law or to protect users and the service.</p>
        <p>Cashfree receives information necessary to process a payment, such as order details and customer contact information. The payment provider’s own privacy terms apply to its processing.</p>
      </InfoSection>

      <InfoSection title="5. Retention and deletion">
        <p>Account, enrollment, task, certificate and transaction records are kept in the platform’s Supabase database; public domain responses may be cached temporarily in Redis. A fixed retention schedule and account self-service deletion workflow are not established in the inspected application. Contact support to request access, correction or deletion, and we will review the request under applicable legal, operational and transaction-record requirements.</p>
      </InfoSection>

      <InfoSection title="6. Security">
        <p>The application uses authentication, access controls and server-side payment verification. No online system can be guaranteed completely secure. Keep your credentials private and promptly report suspected unauthorized access.</p>
      </InfoSection>

      <InfoSection title="7. Your choices and applicable law">
        <p>You may contact us to ask about personal information associated with your account or to request correction or deletion. We will handle requests in accordance with applicable Indian privacy and data-protection requirements. Where a request cannot be fully completed, we will explain the applicable reason where permitted.</p>
      </InfoSection>

      <InfoSection title="8. Changes and privacy contact">
        <p>We may update this policy as the service or applicable requirements change. The current version and update date will appear on this page. Send privacy questions to <a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a>.</p>
      </InfoSection>
    </PublicInfoLayout>
  );
}
