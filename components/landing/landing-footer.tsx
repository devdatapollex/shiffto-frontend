import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import logoWithName from '@/public/logo-with-name.png';
import playStoreIcon from '@/public/play-store icon.png';
import appStoreIcon from '@/public/app-store icon.png';

export function LandingFooter() {
  return (
    <footer className="w-full bg-accent text-[#F9FAFB] py-[48px] px-6 md:px-16 lg:px-[128px] flex flex-col gap-[40px]">
      {/* 2. Main Content Area Container */}
      <div className="flex flex-col justify-between gap-[40px] w-full">
        {/* Top Row: Left Side Logo & Description | Right Side Store Buttons */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-0 w-full">
          {/* Left side logo and description section */}
          <div className="flex flex-col gap-[8px] max-w-sm md:max-w-md">
            <Image
              src={logoWithName}
              alt="Shiftto Logo"
              width={120}
              height={60}
              className="h-auto w-[120px] object-contain"
              priority
            />
            <p className="text-sm font-normal leading-relaxed text-[#F9FAFB]">
              Shiftto is an innovative peer-to-peer delivery platform that seamlessly connects
              travelers with individuals looking to send packages across international borders.
            </p>
          </div>

          {/* Right side store buttons */}
          <div className="flex flex-col gap-[24px] items-start md:items-end">
            <a
              href="#"
              className="inline-block transition-transform hover:scale-105 active:scale-95"
              aria-label="Get it on Google Play"
            >
              <Image
                src={playStoreIcon}
                alt="Get it on Google Play"
                width={135}
                height={40}
                className="h-[40px] w-auto object-contain"
              />
            </a>
            <a
              href="#"
              className="inline-block transition-transform hover:scale-105 active:scale-95"
              aria-label="Download on the App Store"
            >
              <Image
                src={appStoreIcon}
                alt="Download on the App Store"
                width={135}
                height={40}
                className="h-[40px] w-auto object-contain"
              />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
          {/* Left side section (page link texts) */}
          <nav className="flex flex-wrap items-center gap-[32px]">
            <Link
              href="#about"
              className="font-normal text-[16px] leading-[16px] tracking-normal text-[#F9FAFB] hover:opacity-80 transition-opacity"
            >
              About
            </Link>
            <Link
              href="#pricing"
              className="font-normal text-[16px] leading-[16px] tracking-normal text-[#F9FAFB] hover:opacity-80 transition-opacity"
            >
              Pricing
            </Link>
            <Link
              href="#tracking"
              className="font-normal text-[16px] leading-[16px] tracking-normal text-[#F9FAFB] hover:opacity-80 transition-opacity"
            >
              Tracking
            </Link>
            <Link
              href="#contact"
              className="font-normal text-[16px] leading-[16px] tracking-normal text-[#F9FAFB] hover:opacity-80 transition-opacity"
            >
              Contact
            </Link>
            <Link
              href="#faqs"
              className="font-normal text-[16px] leading-[16px] tracking-normal text-[#F9FAFB] hover:opacity-80 transition-opacity"
            >
              FAQs
            </Link>
          </nav>

          {/* Right side icons section */}
          <div className="flex items-center justify-between gap-4">
            <Link href="#" aria-label="X (Twitter)" className="hover:opacity-80 transition-opacity">
              <Twitter className="w-[16px] h-[16px] text-primary" />
            </Link>
            <Link href="#" aria-label="Dribbble" className="hover:opacity-80 transition-opacity">
              <Facebook className="w-[16px] h-[16px] text-primary" />
            </Link>
            <Link href="#" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
              <Instagram className="w-[16px] h-[16px] text-primary" />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="hover:opacity-80 transition-opacity">
              <Linkedin className="w-[16px] h-[16px] text-primary" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom Footer Section Container */}
      <div className="flex flex-col gap-[24px] border-t border-[#556881] pt-[24px] w-full">
        {/* Copyright and terms section */}
        <div className="flex items-center justify-end gap-[12px] w-full">
          <span className="font-normal text-[12px] leading-[16px] tracking-normal text-[#F9FAFB]">
            © 2026 Shiftto
          </span>
          <span className="w-[2px] h-[2px] rounded-full bg-[#7C7C7C]" />
          <Link
            href="#"
            className="font-normal text-[12px] leading-[16px] tracking-normal text-[#F9FAFB] hover:underline"
          >
            Terms
          </Link>
          <span className="w-[2px] h-[2px] rounded-full bg-[#7C7C7C]" />
          <Link
            href="#"
            className="font-normal text-[12px] leading-[16px] tracking-normal text-[#F9FAFB] hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
