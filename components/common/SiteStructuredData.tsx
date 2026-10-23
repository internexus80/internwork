import { SITE_URL } from '@/lib/siteMetadata';

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'InternJourneys',
    url: SITE_URL,
    email: 'bhuvaneshbhuvan128@gmail.com',
    founder: {
      '@type': 'Person',
      name: 'VADIVEL BHUVANESH',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pudukkottai district',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'InternJourneys',
    url: SITE_URL,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  },
];

export function SiteStructuredData() {
  return (
    <>
      {structuredData.map((entity) => (
        <script
          key={entity['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entity).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
