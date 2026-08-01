import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { Users, Truck, CheckCircle2, Lock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Top Hero Layout: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Headline, Subtitle, and Call to Actions */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            <span className="block">Send Anything.</span>
            <span className="block">Across Borders.</span>
            <span className="block">Through People.</span>
          </h1>

          <p className="text-lg max-w-xl">
            Shiffto connects trusted travelers and senders to deliver parcels safely, affordably and
            efficiently
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href={ROUTES.CREATE_SHIPMENT}>
              <button type="button" className="px-6 py-3 font-medium border rounded-md">
                Send parcel
              </button>
            </Link>
            <Link href={ROUTES.CREATE_TRIP}>
              <button type="button" className="px-6 py-3 font-medium border rounded-md">
                Become a traveler
              </button>
            </Link>
          </div>
        </div>

        {/* Right Column: Empty placeholder slot for Hero graphic */}
        <div></div>
      </div>

      {/* Bottom Stats Banner: 4-Column Grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border rounded-xl">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 shrink-0" />
          <div>
            <h3 className="text-xl font-bold">12K+</h3>
            <p className="text-sm">Verified travelers</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Truck className="h-8 w-8 shrink-0" />
          <div>
            <h3 className="text-xl font-bold">25K+</h3>
            <p className="text-sm">Successful deliveries</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-8 w-8 shrink-0" />
          <div>
            <h3 className="text-xl font-bold">98.7%</h3>
            <p className="text-sm">Delivery success rate</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Lock className="h-8 w-8 shrink-0" />
          <div>
            <h3 className="text-xl font-bold">100%</h3>
            <p className="text-sm">Secure Escrow</p>
          </div>
        </div>
      </div>
    </section>
  );
}
