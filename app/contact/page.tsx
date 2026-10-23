import type { Metadata } from 'next';
import { InfoSection, PublicInfoLayout } from '@/components/common/PublicInfoLayout';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact INTERNJOURNEYS for questions about virtual internships, accounts, payments or certificates.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact InternJourneys',
    description: 'Contact InternJourneys for questions about virtual internships, accounts, payments or certificates.',
    url: '/contact',
  },
  twitter: {
    title: 'Contact InternJourneys',
    description: 'Contact InternJourneys for platform, payment, or certificate support.',
  },
};

export default function ContactPage() {
  return (
    <PublicInfoLayout
      title="Contact Us"
      description="Contact InternJourneys for help with the platform, internship tasks, payments, certificates or privacy requests."
    >
      <InfoSection title="Business information">
        <dl className="grid gap-3 sm:grid-cols-[190px_1fr]">
          <dt className="font-semibold text-slate-900">Business name</dt>
          <dd>InternJourneys</dd>
          <dt className="font-semibold text-slate-900">Proprietor</dt>
          <dd>VADIVEL BHUVANESH</dd>
          <dt className="font-semibold text-slate-900">Business location</dt>
          <dd>Pudukkottai district, Tamil Nadu, India</dd>
          <dt className="font-semibold text-slate-900">Support email</dt>
          <dd><a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a></dd>
        </dl>
      </InfoSection>

      <InfoSection title="What to include in a support request">
        <p>For payment questions, include your account email and Cashfree order or transaction reference. For task or certificate questions, include your internship domain and certificate identifier if you have one. Never include passwords, payment PINs, card credentials or one-time passcodes.</p>
        <p>Support response times are not specified on this page. We will review the details and reply using the contact information you provide.</p>
      </InfoSection>
    </PublicInfoLayout>
  );
}
