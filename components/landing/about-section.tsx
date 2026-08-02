import Image from 'next/image';
import aboutSectionImage from '@/public/about-section-image.png';

export function AboutSection() {
  return (
    <section className="w-full bg-secondary py-40 px-32">
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side: Image */}
        <div className="w-full lg:w-1/2 flex justify-center shrink-0">
          <Image
            src={aboutSectionImage}
            alt="About Shiftto illustration"
            className="w-full max-w-[580px] h-auto object-contain"
            priority
          />
        </div>

        {/* Right Side: Text Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3">
          <h2 className="font-medium text-[40px] leading-[48px] tracking-[-2px] text-foreground">
            About Us
          </h2>

          <p className="font-normal text-[16px] leading-[24px] tracking-normal text-[#71717A]">
            Shiftto is an innovative peer-to-peer delivery platform that seamlessly connects
            travelers with individuals looking to send packages across international borders. By
            leveraging the available luggage space on real journeys, we make cross-border shipping
            not only more affordable but also flexible and personal.
          </p>

          <p className="font-normal text-[16px] leading-[24px] tracking-normal text-[#71717A]">
            Our mission is to cultivate a trusted community where every delivery is verified,
            tracked, and treated with utmost care, ensuring that sending something abroad feels as
            effortless as sharing a trip with a friend.
          </p>

          <p className="font-normal text-[16px] leading-[24px] tracking-normal text-[#71717A]">
            Join us in revolutionizing the way we perceive shipping and travel, and experience the
            joy of connecting with others through your journeys!
          </p>
        </div>
      </div>
    </section>
  );
}
