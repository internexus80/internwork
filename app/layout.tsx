import type { Metadata } from 'next';
import type { Viewport } from 'next';
import { Plus_Jakarta_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { SITE_URL } from '@/lib/siteMetadata';
import { SiteStructuredData } from '@/components/common/SiteStructuredData';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'InternJourneys — Virtual Internships That Build Real Skills',
    template: '%s | InternJourneys',
  },
  description: 'Explore structured virtual internships, project-based learning tasks, and certificates with online verification through InternJourneys.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'InternJourneys',
    title: 'InternJourneys — Virtual Internships That Build Real Skills',
    description: 'Explore structured virtual internships, project-based learning tasks, and certificates with online verification through InternJourneys.',
    url: '/',
    images: [{ url: '/assets/hero-student.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/hero-student.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: '/assets/internjourneys-monogram.png',
    shortcut: '/assets/internjourneys-monogram.png',
    apple: '/assets/internjourneys-monogram.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1d61ff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} ${cormorant.variable} ${jakarta.className} min-h-screen bg-background text-slate-900 antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-slate-900 focus:shadow-xl"
        >
          Skip to main content
        </a>
        <SiteStructuredData />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
