import Image from 'next/image';
import wave1 from '@/public/available-device bg wave-1.svg';
import wave2 from '@/public/available-device bg wave-2.svg';
import playStoreIcon from '@/public/play-store icon.png';
import appStoreIcon from '@/public/app-store icon.png';
import iphoneMock from '@/public/iphone mock.png';
import laptopMock from '@/public/laptop mock.png';
import tabletMock from '@/public/tablet mock.png';

export function AppDownloadSection() {
  return (
    <section className="relative w-full bg-white px-6 py-16 lg:px-[128px] lg:pt-[128px] lg:pb-0  flex flex-col items-center gap-[22px] overflow-hidden">
      {/* Background Gradient Waves */}
      <div className="absolute inset-0 pointer-events-none z-0 w-full h-full flex items-end justify-center overflow-hidden">
        {/* Wave 1 (Behind - Pink Glow: Large Scale) */}
        <div className="absolute bottom-0 inset-x-0 w-full h-full flex items-end justify-center z-0">
          <Image
            src={wave1}
            alt=""
            className="w-full h-full object-cover object-bottom scale-110 origin-bottom opacity-90"
            priority
          />
        </div>

        {/* Wave 2 (In front of Wave 1 - Orange Glow: Full horizontal width, vertically scaled down) */}
        <div className="absolute bottom-0 inset-x-0 w-full h-full flex items-end justify-center z-10">
          <Image
            src={wave2}
            alt=""
            className="w-full h-full object-cover object-bottom scale-y-[0.6] scale-x-105 origin-bottom opacity-90"
            priority
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-[22px] w-full max-w-7xl">
        {/* Text Section */}
        <div className="flex flex-col items-center gap-6 max-w-3xl text-center">
          <h2 className="font-medium text-[40px] sm:text-5xl lg:text-[60px] leading-tight lg:leading-[72px] tracking-tight text-foreground lg:text-nowrap">
            Available on all your devices
          </h2>
          <p className="font-normal text-base leading-[24px] tracking-normal text-foreground lg:text-nowrap">
            Experience Shiftto from anywhere, anytime. Shiftto is available across laptop, tablet
            and mobile phones
          </p>
        </div>

        {/* Store Icons Section */}
        <div className="flex flex-wrap items-center justify-center gap-6 my-2">
          <a
            href="#"
            className="inline-block transition-transform hover:scale-105 active:scale-95"
            aria-label="Get it on Google Play"
          >
            <Image
              src={playStoreIcon}
              alt="Get it on Google Play"
              className="h-12 w-auto object-contain"
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
              className="h-12 w-auto object-contain"
            />
          </a>
        </div>

        {/* Mocks Section */}
        <div className="w-full max-w-[880px] relative mt-4 flex justify-center items-center">
          {/* Laptop Mock (Center Backdrop Anchor) */}
          <div className="w-full z-0">
            <Image
              src={laptopMock}
              alt="Shiftto Laptop App Dashboard"
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* iPhone Mock (Overlapping Laptop Bottom-Left) */}
          <div className="absolute left-[14%] md:left-[0%] md:bottom-[0%] -bottom-[5%] md:w-[22%] w-[19%] max-w-[180px] z-20">
            <Image
              src={iphoneMock}
              alt="Shiftto Mobile App"
              width={180}
              height={360}
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Tablet Mock (Overlapping Laptop Bottom-Right) */}
          <div className="absolute md:right-[1%] right-[3%] md:bottom-[0%] -bottom-[5%] md:w-[46%] w-[43%] max-w-[410px] z-10">
            <Image
              src={tabletMock}
              alt="Shiftto Tablet App"
              width={410}
              height={310}
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
