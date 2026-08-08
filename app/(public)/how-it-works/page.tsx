import { HowItWorksView } from '@/components/landing/how-it-works-view';
import { FAQSection } from '@/components/landing/faq-section';
import { AppDownloadSection } from '@/components/landing/app-download-section';
import { CTASection } from '@/components/landing/cta-section';

export const metadata = {
  title: 'How It Works | Shiffto',
  description:
    'Learn how Shiffto connects senders with verified travelers to ship parcels across borders safely and affordably.',
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col bg-secondary">
      <HowItWorksView />

      <FAQSection />
      <AppDownloadSection />
      <CTASection />
    </div>
  );
}
