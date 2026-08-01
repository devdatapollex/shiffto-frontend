import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { FeaturesSection } from '@/components/landing/features-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
    </div>
  );
}
