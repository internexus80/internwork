import type { Metadata } from 'next';
import { InfoSection, PublicInfoLayout } from '@/components/common/PublicInfoLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the terms for using InternJourneys virtual internships and project-based learning services.',
  alternates: {
    canonical: '/terms-and-conditions',
  },
  openGraph: {
    title: 'Terms & Conditions',
    description: 'Read the terms for using InternJourneys virtual internships and project-based learning services.',
    url: '/terms-and-conditions',
  },
  twitter: {
    title: 'Terms & Conditions',
    description: 'Read the terms for using InternJourneys virtual internships and project-based learning services.',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <PublicInfoLayout
      title="Terms & Conditions"
      description="These terms explain how you may use the InternJourneys platform and how internship tasks, certificate eligibility and payments work."
      updatedAt="2 June 2026"
    >
      <InfoSection title="1. Service provider and acceptance">
        <p>InternJourneys is the business name, operated by proprietor VADIVEL BHUVANESH in Pudukkottai district, Tamil Nadu, India. The business identifies as an Udyam-registered Micro enterprise. By creating an account or using the platform, you agree to these terms. If you do not agree, do not use account-only services.</p>
        <p>Udyam registration identifies the enterprise as a micro enterprise; it does not represent university, government, employer or professional accreditation of an internship or certificate.</p>
      </InfoSection>

      <InfoSection title="2. What the platform provides">
        <p>InternJourneys provides online virtual internship tracks and structured, project-based learning. Depending on the selected domain, the platform may provide learning tasks, guides, resources, work-submission tools, progress tracking, offer-letter materials and a certificate eligibility workflow.</p>
        <p>The service is for learning and portfolio development. Participation does not guarantee a job, placement, salary, academic credit, employment outcome, or recognition by a particular college, university, employer or government body.</p>
      </InfoSection>

      <InfoSection title="3. Eligibility and account responsibilities">
        <p>You must provide accurate account information, keep your sign-in credentials confidential, and promptly correct information that changes. You are responsible for activity carried out through your account. Contact support if you believe your account has been accessed without permission.</p>
        <p>Do not impersonate another person, provide misleading information, interfere with the platform, or use another student’s work as your own.</p>
      </InfoSection>

      <InfoSection title="4. Enrollment, tasks and submissions">
        <p>Available domains, durations, tasks and requirements are shown in the platform and may change as tracks are maintained. Enrollment creates a learning record. Follow task instructions and submit work you are authorized to share. Do not submit harmful, unlawful, infringing or confidential third-party material.</p>
        <p>Task status is determined by the platform’s configured verification workflow and, where applicable, administrative review. A submission may need correction or resubmission. Keep your own copies of project work and submission links.</p>
      </InfoSection>

      <InfoSection title="5. Certificate eligibility and fee">
        <p>The certificate processing fee is ₹199 INR. The fee is displayed before checkout. A certificate is eligible for issuance only after all required tasks for the relevant internship are complete and the payment has been successfully verified by the payment provider and InternJourneys.</p>
        <p>After successful payment verification and confirmation of task eligibility, the certificate becomes available through the platform. Incomplete tasks, provider delays, discrepancies in payment records or technical issues can delay availability. A browser redirect alone is not payment confirmation.</p>
      </InfoSection>

      <InfoSection title="6. Payments">
        <p>Payments are processed through Cashfree. The payment provider’s checkout and applicable payment terms also apply. InternJourneys stores payment references and status information needed to reconcile transactions and certificate eligibility; it does not ask you to send card PINs, passwords or one-time passcodes to support.</p>
        <p>If a payment appears pending or you see an unexpected charge, contact <a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a> with the transaction reference and account email.</p>
      </InfoSection>

      <InfoSection title="7. Content and intellectual property">
        <p>Platform text, task materials, branding and software belong to InternJourneys or their respective rights holders. You may use the learning materials for your personal participation in the program; do not redistribute or commercially exploit them without permission.</p>
        <p>You retain rights in work you create, subject to any third-party materials or licenses you use. By submitting work, you permit InternJourneys to process and display it as needed to operate the task review and certificate workflow. Any broader public use should be separately agreed.</p>
      </InfoSection>

      <InfoSection title="8. Availability and account action">
        <p>We work to keep the service available, but online services can experience maintenance, outages or technical limitations. Features, domain content and workflows may be updated to maintain or improve the service.</p>
        <p>We may restrict or suspend access where reasonably necessary to address misuse, security risks, unlawful conduct or material breach of these terms. Where practicable, we will explain the reason and provide a way to contact support about the decision. This does not limit rights available under applicable law.</p>
      </InfoSection>

      <InfoSection title="9. Support, disputes and changes">
        <p>Questions or complaints can be sent to <a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a>. We will review requests and respond through the contact information associated with the request; no response timeframe is stated here.</p>
        <p>These terms may be updated when the service or legal requirements change. The current version and its update date will be published on this page. Applicable Indian laws continue to apply, including consumer rights that cannot lawfully be excluded.</p>
      </InfoSection>
    </PublicInfoLayout>
  );
}
