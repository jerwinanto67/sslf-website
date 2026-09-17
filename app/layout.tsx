import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SSLF City & Housing | DTCP & CMDA Approved Plots, Villas & Apartments in Chennai',
  description:
    'Sree Sarabeswaraa Land Foundation — 17+ years of trusted real estate in Chennai. Ready-to-build DTCP/CMDA approved plots in Oragadam, Uthukottai & Ekkatuthangal. ISO 9001:2015 certified.',
  keywords: ['DTCP plots Chennai', 'CMDA approved plots', 'Oragadam plots', 'SSLF City Housing', 'villas Chennai'],
  openGraph: { title: 'SSLF City & Housing', description: 'Build your dream home on clear-title approved plots across Chennai.', type: 'website' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'SSLF City & Housing (Sree Sarabeswaraa Land Foundation)',
  founder: { '@type': 'Person', name: 'Dr. G. Sakthivel' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '210, Defence Colony 15th Cross St, Ekkatuthangal',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    postalCode: '600032',
    addressCountry: 'IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-slate-900 antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
