import Image from 'next/image';
import mapBg from '@/public/map-bg.png';
import userGroup from '@/public/user-group.png';
import truck from '@/public/truck.png';
import check from '@/public/check.png';
import lock from '@/public/lock.png';
import { AboutSection } from '@/components/landing/about-section';
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
      <section className="relative overflow-hidden w-full pt-12 md:pt-16 pb-16 md:pb-24 bg-gradient-to-b from-[#FFF5EF]/80 to-secondary">
        {/* World Map Background Vector */}
        <div className="absolute top-0 right-0 h-full w-full md:w-[75%] pointer-events-none z-0 opacity-80 select-none md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_30%)]">
          <Image
            src={mapBg}
            alt="World Map Background"
            fill
            priority
            className="object-contain object-right origin-right"
          />
        </div>

        {/* Hero Content Container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 max-w-7xl relative z-10 flex flex-col gap-12">
          <div className="max-w-2xl flex flex-col gap-3">
            <span className="text-[12px] font-bold tracking-[2.5px] uppercase text-[#F05336]">
              OUR STORY
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-bold tracking-[-1.5px] leading-tight text-foreground">
              Shipping reimagined.{' '}
              <span className="text-[#F05336]">People-powered.</span>
            </h1>
            <p className="text-base text-[#6B7280] font-normal leading-relaxed mt-2">
              Shiffto was born from a simple observation: every day, millions of people travel across
              borders with empty luggage space — while others struggle to send packages affordably.
              We built a platform to connect them.
            </p>
          </div>

          {/* Stats Bar Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 px-6 py-6 border rounded-2xl bg-white/90 backdrop-blur-sm items-center shadow-[0px_6px_15px_-2px_#10182814]">
            <div className="flex items-center gap-3.5">
              <Image
                src={userGroup}
                alt="User Group"
                className="w-[34px] sm:w-[42px] h-auto shrink-0 object-contain"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight">12K+</h3>
                <p className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap">
                  Verified travelers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Image
                src={truck}
                alt="Truck"
                className="w-[36px] sm:w-11 h-auto shrink-0 object-contain"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight">29K+</h3>
                <p className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap">
                  Successful deliveries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Image src={check} alt="Check" className="w-9 sm:w-12 h-auto shrink-0 object-contain" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight">98.7%</h3>
                <p className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap">
                  Delivery success rate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Image
                src={lock}
                alt="Lock"
                className="w-[26px] sm:w-8 h-auto shrink-0 object-contain"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight">100%</h3>
                <p className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap">Secure Escrow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
