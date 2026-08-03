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
    <section className="relative overflow-hidden w-full mt-20">
      {/* Full-Bleed Map Background with Opacity and Left Fade */}
      <div className="absolute md:-top-45 md:-right-100  xl:-top-35 xl:-right-70 -translate-x-6 sm:-translate-x-10 md:-translate-x-16 h-full w-full  md:w-[90%] xl:w-[85%] pointer-events-none z-0 md:opacity-80 xl:opacity-90 select-none md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_20%)] xl:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_40%)]">
        <Image
          src={mapBg}
          alt="World Map Background"
          fill
          priority
          className="object-contain object-right lg:scale-140 xl:scale-125 origin-right"
        />
      </div>

      {/* Hero Foreground Content */}
      <div className="container flex flex-col gap-40 mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Top Hero Layout: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: Headline, Subtitle, and Call to Actions */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-5xl lg:text-[60px] font-bold leading-tight md:leading-[54px] lg:leading-[60px] tracking-[-1px] lg:tracking-[-2px]">
              <span className="block">Send Anything.</span>
              <span className="block">Across Borders.</span>
              <span className="block text-accent-foreground">Through People.</span>
            </h1>

            <p className="text-base md:text-lg lg:text-[20px] text-[#404040] max-w-md lg:max-w-[400px] leading-normal md:leading-[26px] lg:leading-[28px]">
              Shiffto connects trusted travelers and senders to deliver parcels safely, affordably
              and efficiently
            </p>

            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <Link href={ROUTES.CREATE_SHIPMENT} className="flex-1 max-w-[200px]">
                <Button className="w-full h-[44px] px-2 sm:px-4 py-3 bg-foreground font-medium rounded-md text-xs sm:text-lg whitespace-nowrap">
                  Send parcel
                </Button>
              </Link>
              <Link href={ROUTES.CREATE_TRIP} className="flex-1 max-w-[200px]">
                <Button
                  variant="outline"
                  className="w-full h-[44px] px-2 sm:px-4 py-3 font-medium rounded-md text-xs sm:text-lg whitespace-nowrap"
                >
                  Become a traveler
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Empty placeholder slot for Hero graphic */}
          <div></div>
        </div>

        {/* Bottom Stats Banner: 4-Column Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-11 py-7 border rounded-3xl bg-white/80 items-center shadow-[0px_6px_15px_-2px_#10182814]">
          <div className="flex justify-center items-center gap-3">
            <Image src={userGroup} alt="User Group" className="w-[42px] h-9" />
            <div>
              <h3 className="text-xl font-bold">12K+</h3>
              <p className="text-sm">Verified travelers</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Image src={truck} alt="Truck" className="w-11 h-10" />
            <div>
              <h3 className="text-xl font-bold">25K+</h3>
              <p className="text-sm">Successful deliveries</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Image src={check} alt="Check" className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold">98.7%</h3>
              <p className="text-sm">Delivery success rate</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Image src={lock} alt="Lock" className="w-8 h-[42px]" />
            <div>
              <h3 className="text-xl font-bold">100%</h3>
              <p className="text-sm">Secure Escrow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
