import Image from 'next/image';
import playStoreIcon from '@/public/play-store icon.png';
import appStoreIcon from '@/public/app-store icon.png';
import iphoneMock from '@/public/iphone mock.png';
import laptopMock from '@/public/laptop mock.png';
import tabletMock from '@/public/tablet mock.png';

export function AppDownloadSection() {
  return (
    <section className="w-full bg-white px-6 py-16 lg:p-[128px] flex flex-col items-center gap-[22px]">
      {/* Text Section */}
      <div className="flex flex-col items-center gap-6 max-w-3xl text-center">
        <h2 className="font-medium text-4xl sm:text-5xl lg:text-[60px] leading-tight lg:leading-[72px] tracking-tight text-foreground">
          Available on all your devices
        </h2>
        <p className="font-normal text-base leading-[24px] tracking-normal text-foreground">
          Experience Shiftto from anywhere, anytime. Shiftto is available across laptop, tablet and
          mobile phones
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
      <div className="w-full max-w-[1020px] relative mt-4 flex justify-center items-center">
        {/* Laptop Mock (Center Anchor) */}
        <div className="w-[88%] sm:w-[85%] max-w-[840px] z-0">
          <Image
            src={laptopMock}
            alt="Shiftto Laptop App Dashboard"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* iPhone Mock (Bottom Left Overlay) */}
        <div className="absolute left-[0%] sm:left-[3%] -bottom-[4%] sm:-bottom-[6%] w-[26%] sm:w-[22%] max-w-[210px] z-20">
          <Image
            src={iphoneMock}
            alt="Shiftto Mobile App"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* Tablet Mock (Bottom Right Overlay) */}
        <div className="absolute right-[0%] sm:right-[1%] -bottom-[3%] sm:-bottom-[5%] w-[48%] sm:w-[44%] max-w-[420px] z-10">
          <Image
            src={tabletMock}
            alt="Shiftto Tablet App"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
