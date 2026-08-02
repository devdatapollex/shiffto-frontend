import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { Button } from '../ui/button';
import userGroup from '@/public/user-group.png';
import truck from '@/public/truck.png';
import check from '@/public/check.png';
import lock from '@/public/lock.png';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Top Hero Layout: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Headline, Subtitle, and Call to Actions */}
        <div className="flex flex-col gap-6">
          <h1 className="text-[52px] font-bold leading-tight">
            <span className="block">Send Anything.</span>
            <span className="block">Across Borders.</span>
            <span className="block text-accent-foreground">Through People.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
            Shiffto connects trusted travelers and senders to deliver parcels safely, affordably and
            efficiently
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.CREATE_SHIPMENT}>
              <Button className="w-[165.5px] px-4 py-3 bg-foreground font-medium rounded-md">
                Send parcel
              </Button>
            </Link>
            <Link href={ROUTES.CREATE_TRIP}>
              <Button variant="outline" className="px-4 py-3 font-medium rounded-md">
                Become a traveler
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Empty placeholder slot for Hero graphic */}
        <div></div>
      </div>

      {/* Bottom Stats Banner: 4-Column Grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-11 py-7 border rounded-3xl bg-white/80 items-center">
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
    </section>
  );
}
