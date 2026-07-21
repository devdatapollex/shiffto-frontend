import { Metadata } from 'next';
import { seoConfig } from '@/config/seo.config';

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = seoConfig.description,
  image = seoConfig.ogImage,
  noIndex = false,
}: MetadataProps = {}): Metadata {
  return {
    title: {
      default: seoConfig.title,
      template: `%s — ${seoConfig.title}`,
    },
    description,
    keywords: seoConfig.keywords,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      title: title ? `${title} — ${seoConfig.title}` : seoConfig.title,
      description,
      siteName: 'SHIFFTO',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || seoConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} — ${seoConfig.title}` : seoConfig.title,
      description,
      images: [image],
      creator: seoConfig.twitterHandle,
    },
    icons: {
      icon: '/shiffto-icon.svg',
      shortcut: '/shiffto-icon.svg',
      apple: '/shiffto-icon.svg',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
