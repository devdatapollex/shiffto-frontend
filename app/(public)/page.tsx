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
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <AboutSection />
      <AppDownloadSection />
      <FAQSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
