import { Metadata } from 'next';

export const seoConfig = {
  title: 'SHIFFTO — Send, Travel, Earn',
  description:
    'One account. Both sides of every shipment. Create shipments, add trips, and earn — all from a single unified wallet.',
  keywords: [
    'shiffto',
    'peer to peer shipping',
    'send packages',
    'travel delivery',
    'shipment platform',
  ],
  twitterHandle: '@shiffto',
  ogImage: '/og-image.png',
};

export const constructMetadata = (overrides?: Partial<Metadata>): Metadata => {
  const base: Metadata = {
    title: {
      default: seoConfig.title,
      template: `%s — ${seoConfig.title}`,
    },
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      title: seoConfig.title,
      description: seoConfig.description,
      siteName: 'SHIFFTO',
      images: [
        {
          url: seoConfig.ogImage,
          width: 1200,
          height: 630,
          alt: 'SHIFFTO',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.title,
      description: seoConfig.description,
      images: [seoConfig.ogImage],
    },
    icons: {
      icon: '/favicon.ico',
    },
  };

  return { ...base, ...overrides };
};
