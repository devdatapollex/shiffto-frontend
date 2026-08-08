import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { Button } from '../ui/button';
import userGroup from '@/public/user-group.png';
import truck from '@/public/truck.png';
import check from '@/public/check.png';
import lock from '@/public/lock.png';
import mapBg from '@/public/map-bg.png';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden w-full pt-10 md:pt-15 lg:pt-20">
      {/* Full-Bleed Map Background with Opacity and Left Fade */}
      <div className="absolute -top-60 min-[480px]:-top-55 min-[560px]:-top-45 min-[640px]:-top-32 md:-top-30 lg:-top-30 xl:-top-30 2xl:-top-25 -right-40 min-[480px]:-right-62 min-[560px]:-right-75 md:-right-80 lg:-right-85 xl:-right-70 2xl:-right-40 -translate-x-6 sm:-translate-x-10 md:-translate-x-16 h-full w-full  md:w-[90%] xl:w-[85%] pointer-events-none z-0 opacity-80 xl:opacity-90 select-none md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_20%)] xl:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_40%)]">
        <Image
          src={mapBg}
          alt="World Map Background"
          fill
          priority
          className="object-contain object-right scale-160 md:scale-150 lg:scale-140 xl:scale-125 2xl:scale-100 origin-right"
        />
      </div>

      {/* Hero Foreground Content */}
      <div className="container flex flex-col lg:gap-40 mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Top Hero Layout: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: Headline, Subtitle, and Call to Actions */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-5xl lg:text-[52px] font-bold leading-tight md:leading-[48px] lg:leading-[56px] tracking-[-1px] lg:tracking-[-2px]">
              <span className="block">Send Anything.</span>
              <span className="block">Across Borders.</span>
              <span className="block text-accent-foreground">Through People.</span>
            </h1>

            <p className="text-base text-[16px] text-[#404040] max-w-[400px] leading-[24px]">
              Shiffto connects trusted travelers and senders to deliver parcels safely, affordably
              and efficiently
            </p>

            <div className="flex flex-row items-center gap-2">
              <Link href={ROUTES.CREATE_SHIPMENT} className="flex-1 max-w-[140px] lg:max-w-[165px]">
                <Button className="w-full h-[36px] lg:h-[40px] px-2 sm:px-4 py-3 bg-foreground font-medium rounded-md text-xs lg:text-sm whitespace-nowrap">
                  Send parcel
                </Button>
              </Link>
              <Link href={ROUTES.CREATE_TRIP} className="flex-1 max-w-[140px] lg:max-w-[165px]">
                <Button
                  variant="outline"
                  className="w-full h-[36px] lg:h-[40px] px-2 sm:px-4 py-3 font-medium rounded-md text-xs lg:text-sm whitespace-nowrap"
                >
                  Become a traveler
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Empty placeholder slot for Hero graphic */}
          <div></div>
        </div>

        {/* Bottom Stats Banner: Responsive 4-Column Grid */}
        <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 px-4 py-5 xs:px-6 xs:py-6 sm:px-8 lg:px-11 lg:py-7 border rounded-2xl sm:rounded-3xl bg-white/90 md:bg-white/80 backdrop-blur-sm items-center shadow-[0px_6px_15px_-2px_#10182814]">
          <div className="flex justify-start sm:justify-center items-center gap-3 sm:gap-3.5 mx-auto sm:mx-0 w-full max-w-[220px] sm:max-w-none">
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

          <div className="flex justify-start sm:justify-center items-center gap-3 sm:gap-3.5 mx-auto sm:mx-0 w-full max-w-[220px] sm:max-w-none">
            <Image
              src={truck}
              alt="Truck"
              className="w-[36px] sm:w-11 h-auto shrink-0 object-contain"
            />
            <div>
              <h3 className="text-lg sm:text-xl font-bold leading-tight">25K+</h3>
              <p className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap">
                Successful deliveries
              </p>
            </div>
          </div>

          <div className="flex justify-start sm:justify-center items-center gap-3 sm:gap-3.5 mx-auto sm:mx-0 w-full max-w-[220px] sm:max-w-none">
            <Image src={check} alt="Check" className="w-9 sm:w-12 h-auto shrink-0 object-contain" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold leading-tight">98.7%</h3>
              <p className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap">
                Delivery success rate
              </p>
            </div>
          </div>

          <div className="flex justify-start sm:justify-center items-center gap-3 sm:gap-3.5 mx-auto sm:mx-0 w-full max-w-[220px] sm:max-w-none">
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
  );
}
