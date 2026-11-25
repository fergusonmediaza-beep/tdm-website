/* global document */

/*
 * Tells search engines who TDM is (schema.org Organization), so Google can
 * connect the site, logo, contact details and social profiles.
 * Kept in its own file because the site allows no inline scripts.
 */
const ORGANISATION_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Township Development Model (TDM)',
  alternateName: ['TDM', 'Township Development Model', 'TDM South Africa'],
  url: 'https://tdmza.co.za/',
  logo: 'https://tdmza.co.za/images/logo/tdm-favicon.webp',
  image: 'https://tdmza.co.za/images/logo/tdm-share.webp',
  description: 'A South African project implementation and market access company working in Gauteng township communities.',
  email: 'enquires@tdmza.co.za',
  telephone: '+27110841100',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '35 Ferguson Road, Illovo',
    addressLocality: 'Sandton',
    addressRegion: 'Gauteng',
    addressCountry: 'ZA',
  },
  areaServed: 'Gauteng, South Africa',
  sameAs: [
    'https://www.linkedin.com/company/township-delivery-model/',
    'https://www.instagram.com/tdmza/',
    'https://www.facebook.com/profile.php?id=61587433742212',
  ],
};

function addStructuredData(data) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

addStructuredData(ORGANISATION_DATA);
