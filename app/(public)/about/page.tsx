import Image from 'next/image';
import mapbase from '@/public/mapbase.png';
import { AboutSection } from '@/components/landing/about-section';
import { AboutStatsSection } from '@/components/landing/about-stats-section';
import { AboutValuesSection } from '@/components/landing/about-values-section';
import { AppDownloadSection } from '@/components/landing/app-download-section';
import { CTASection } from '@/components/landing/cta-section';

export const metadata = {
  title: 'About Us | Shiffto',
  description:
    'Shiffto is an innovative peer-to-peer delivery platform connecting travelers with senders for affordable cross-border shipping.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-secondary">
      {/* Hero Section with Map Background */}
      <section className="relative overflow-hidden w-full pt-12 md:pt-16 pb-12 md:pb-16 bg-gradient-to-b from-[#FFF5EF]/80 to-secondary">
        {/* World Map Background Vector */}
        <div className="absolute top-0 right-0 h-full w-full md:w-[75%] pointer-events-none z-0 opacity-40 select-none md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_80%)]">
          <Image
            src={mapbase}
            alt="World Map Background"
            fill
            priority
            className="object-contain object-right origin-right scale-150 md:scale-125 lg:scale-100"
          />
        </div>

        {/* Hero Content Container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 max-w-7xl relative z-10 flex flex-col gap-6">
          <div className="max-w-2xl flex flex-col gap-3">
            <span className="text-[12px] leading-[20px] text-[#F48FA0]">
              Our Story
            </span>
            <h1 className="font-medium text-3xl sm:text-4xl lg:text-[52px]  tracking-[-2px] leading-[52px] text-foreground">
              Shipping reimagined.{' '}
              <span className="block text-accent-foreground">People-powered.</span>
            </h1>
            <p className="text-base text-muted-foreground font-normal leading-[24px] mt-2">
              Shiffto was born from a simple observation: every day, millions of people travel across borders with empty luggage space — while others struggle to send packages affordably. We built a platform to connect them.
            </p>
          </div>
        </div>
      </section>

      {/* Dedicated Full-Width Stats Section */}
      <AboutStatsSection />

      {/* Main About Us Detail Section */}
      <AboutSection showContactButton={true} showSubtitle={true} />

      {/* Core Values Section */}
      <AboutValuesSection />

      {/* App Download Banner */}
      <AppDownloadSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

