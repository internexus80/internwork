import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificate Verification',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CertificateVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
