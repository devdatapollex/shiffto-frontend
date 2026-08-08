import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import aboutSectionImage from '@/public/about-section-image.png';

interface AboutSectionProps {
  showContactButton?: boolean;
  showSubtitle?: boolean;
}

export function AboutSection({ showContactButton = false, showSubtitle = false }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="w-full bg-secondary py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40 px-5 sm:px-8 md:px-12 lg:px-20 xl:px-32"
    >
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
        {/* Left Side: Image */}
        <div className="w-full lg:w-1/2 flex justify-center shrink-0">
          <Image
            src={aboutSectionImage}
            alt="About Shiftto illustration"
            className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[580px] h-auto object-contain"
            priority
          />
        </div>

        {/* Right Side: Text Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3.5 sm:gap-4 md:gap-5">
          {showSubtitle && (
            <span className="text-[12px] font-bold tracking-[2.5px] uppercase text-[#F05336]">
              Who We Are
            </span>
          )}
          <h2 className="font-medium text-2xl sm:text-3xl lg:text-[40px] leading-tight sm:leading-snug lg:leading-[48px] tracking-tight lg:tracking-[-2px] text-foreground">
            About Us
          </h2>

          <p className="font-normal text-sm sm:text-base leading-relaxed sm:leading-[24px] tracking-normal text-[#71717A]">
            Shiftto is an innovative peer-to-peer delivery platform that seamlessly connects
            travelers with individuals looking to send packages across international borders. By
            leveraging the available luggage space on real journeys, we make cross-border shipping
            not only more affordable but also flexible and personal.
          </p>

          <p className="font-normal text-sm sm:text-base leading-relaxed sm:leading-[24px] tracking-normal text-[#71717A]">
            Our mission is to cultivate a trusted community where every delivery is verified,
            tracked, and treated with utmost care, ensuring that sending something abroad feels as
            effortless as sharing a trip with a friend.
          </p>

          <p className="font-normal text-sm sm:text-base leading-relaxed sm:leading-[24px] tracking-normal text-[#71717A]">
            Join us in revolutionizing the way we perceive shipping and travel, and experience the
            joy of connecting with others through your journeys!
          </p>

          {showContactButton && (
            <div className="pt-2">
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#F05336] text-white text-sm font-semibold hover:bg-[#d84429] transition-colors"
              >
                Get in Touch <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
