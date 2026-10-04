import './globals.css';
import { CLINIC, SEO } from '@/config/clinic';

export const metadata = {
  title: SEO.title,
  description: SEO.description,
  keywords: SEO.keywords,
  authors: [{ name: CLINIC.name }],
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: SEO.url,
    siteName: CLINIC.name,
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SEO.url,
  },
};

export default function RootLayout({ children }) {
  // JSON-LD Schema Markup
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'LocalBusiness', 'MedicalBusiness'],
    name: CLINIC.name,
    description: SEO.description,
    url: SEO.url,
    telephone: CLINIC.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Celal, Murat Alpat Cd.',
      addressLocality: 'Turhal',
      addressRegion: 'Tokat',
      postalCode: '60300',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CLINIC.maps.lat,
      longitude: CLINIC.maps.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:30',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: CLINIC.reviews.rating,
      reviewCount: CLINIC.reviews.totalReviews,
      bestRating: 5,
    },
    sameAs: [CLINIC.social.instagram],
    priceRange: '$$',
    image: `${SEO.url}/images/hero/clinic.png`,
  };

  return (
    <html lang="tr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#00b4d8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
