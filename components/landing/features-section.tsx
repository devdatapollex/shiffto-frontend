import Image from 'next/image';
import { Smartphone, ShieldCheck, Tag, MapPin } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Our Features</h2>
      </div>

      {/* Main Grid / Stack */}
      <div className="flex flex-col gap-6">
        {/* 1. Global Traveler Network (Full Width Card) */}
        <div className="border rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden">
          {/* Left Text Content */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h3 className="text-2xl font-bold">Global Traveler Network</h3>
            <p className="text-base text-muted-foreground">
              Connect with verified travelers heading to your destination from anywhere in the
              world.
            </p>
          </div>

          {/* Right Phone Image Placeholder */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-md h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <Smartphone className="h-10 w-10 mb-2 opacity-50" />
              <span className="text-sm font-medium">Phone Image Placeholder</span>
              <span className="text-xs text-muted-foreground mt-1">
                App Home & Search Screen Image
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Below Full Width Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Verified & Secure + Choose Your Price */}
          <div className="flex flex-col gap-6">
            {/* Card 2: Verified & Secure */}
            <div className="border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Verified & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Every traveler goes through identity checks to ensure safe and reliable
                  deliveries.
                </p>
              </div>
              {/* Phone Graphic Placeholder */}
              <div className="w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
                <ShieldCheck className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-sm font-medium">Phone Image Placeholder</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Tracking & Identity Check Details
                </span>
              </div>
            </div>

            {/* Card 3: Choose Your Price */}
            <div className="border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Choose Your Price</h3>
                <p className="text-sm text-muted-foreground">
                  Follow your package journey from handover to final delivery.
                </p>
              </div>
              {/* Offer Card Graphic Placeholder */}
              <div className="w-full h-52 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
                <Tag className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-sm font-medium">Screenshot Placeholder</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Offer & Negotiation Card (Counter offer / Accept)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 40% Stat Banner + Real-Time Tracking */}
          <div className="flex flex-col gap-6">
            {/* Card 4: 40% Stat Banner */}
            <div className="border rounded-2xl p-6 sm:p-8 flex items-center gap-6">
              <span className="text-5xl font-extrabold tracking-tight">40%</span>
              <span className="text-xl font-semibold leading-snug">
                Faster than traditional shipping
              </span>
            </div>

            {/* Card 5: Real-Time Tracking */}
            <div className="border rounded-2xl p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6 overflow-hidden">
              {/* Live Tracking Timeline Graphic Placeholder */}
              <div className="w-full h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
                <MapPin className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-sm font-medium">Screenshot Placeholder</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Live Tracking Steps (Payment confirmed, Picked up, Checked in, In transit,
                  Arrived)
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Real-Time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Follow your package journey from handover to final delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
