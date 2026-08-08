import Image from 'next/image';
import gradientWaveBg from '@/public/gradient-wave-bg.svg';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { FeaturesSection } from '@/components/landing/features-section';
import { AboutSection } from '@/components/landing/about-section';
import { AppDownloadSection } from '@/components/landing/app-download-section';
import { FAQSection } from '@/components/landing/faq-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CTASection } from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-secondary">
      {/* Wrapper section sharing the background gradient vector across Hero & How It Works */}
      <div className="relative w-full overflow-hidden">
        {/* Responsive Background Gradient Wave Vector */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 select-none">
          <Image
            src={gradientWaveBg}
            alt="Gradient Wave Background"
            fill
            priority
            className="object-cover object-top w-full h-full opacity-80"
          />
        </div>

        {/* Foreground Sections */}
        <div className="relative z-10">
          <HeroSection />
          <HowItWorksSection />
        </div>
      </div>

      <div className="relative z-10 -mt-[32px] sm:-mt-[60px] md:-mt-[100px]">
        <FeaturesSection />
      </div>

      <AboutSection />
      <AppDownloadSection />
      <FAQSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
