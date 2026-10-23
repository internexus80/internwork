import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoSection, PublicInfoLayout } from '@/components/common/PublicInfoLayout';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about InternJourneys, its virtual internship tracks, project-based learning approach, and business operator.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About InternJourneys',
    description: 'Learn about InternJourneys, its virtual internship tracks, project-based learning approach, and business operator.',
    url: '/about',
  },
  twitter: {
    title: 'About InternJourneys',
    description: 'Learn about InternJourneys and its virtual internship tracks.',
  },
};

const domains = [
  'Generative AI',
  'Cybersecurity & Ethical Hacking',
  'Cloud Computing & DevOps',
  'Full Stack Development',
  'Web Development',
  'Data Science',
  'AI & Machine Learning',
  'UI/UX Design',
  'Python Programming',
  'Java Programming',
  'Graphic Designing',
  'Mobile App Development',
];

export default function AboutPage() {
  return (
    <PublicInfoLayout
      title="About InternJourneys"
      description="An online virtual internship and project-based learning platform for students who want to practice skills through structured tasks."
    >
      <InfoSection title="Our purpose">
        <p>InternJourneys provides structured virtual internship tracks designed around guided learning tasks and practical project work. Students can choose a domain, enroll online, work through the task roadmap and submit their work through the platform.</p>
        <p>InternJourneys is the business name, operated by proprietor VADIVEL BHUVANESH in Pudukkottai district, Tamil Nadu, India. The business identifies as an Udyam-registered Micro enterprise. This is business identification, not a claim of university accreditation or guaranteed recognition.</p>
      </InfoSection>

      <InfoSection title="Learning journey">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Browse the active internship domains and choose a learning track.</li>
          <li>Create an account and enroll in a domain.</li>
          <li>Complete the required tasks and submit work for the platform’s configured verification workflow.</li>
          <li>Complete all required tasks and pay the ₹199 INR certificate fee. The certificate is made available once payment is verified and eligibility is confirmed.</li>
          <li>Use the certificate identifier on the certificate verification page to check an issued certificate.</li>
        </ol>
      </InfoSection>

      <InfoSection title="Domains in the project catalog">
        <p>The project’s seed catalog includes these learning areas. Current availability can change; the active catalog is shown on the <Link href="/internships" className="font-semibold text-indigo-600 hover:underline">Internships page</Link>.</p>
        <ul className="grid list-disc gap-x-8 gap-y-1 pl-5 sm:grid-cols-2">
          {domains.map((domain) => <li key={domain}>{domain}</li>)}
        </ul>
      </InfoSection>

      <InfoSection title="Certificates and outcomes">
        <p>Certificates are issued only after successful payment verification and completion of all required tasks. Issued certificates have a verification identifier. Participation does not guarantee employment, placement, academic credit or recognition by a specific institution or employer.</p>
      </InfoSection>

      <InfoSection title="Contact">
        <p>For questions about the platform, contact <a className="font-semibold text-indigo-600 hover:underline" href="mailto:bhuvaneshbhuvan128@gmail.com">bhuvaneshbhuvan128@gmail.com</a>. InternJourneys is operated by proprietor VADIVEL BHUVANESH in Pudukkottai district, Tamil Nadu, India.</p>
      </InfoSection>
    </PublicInfoLayout>
  );
}
