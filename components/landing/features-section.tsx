import Image from 'next/image';
import { Smartphone, ShieldCheck, Tag, Zap, MapPin } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Our Features</h2>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Spans 7 cols on LG) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Global Traveler Network */}
          <div className="border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
            <div className="flex-1 flex flex-col gap-3">
              <h3 className="text-2xl font-bold">Global Traveler Network</h3>
              <p className="text-base text-muted-foreground">
                Connect with verified travelers heading to your destination from anywhere in the
                world.
              </p>
            </div>
            {/* Phone Image Placeholder */}
            <div className="w-full sm:w-64 h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center shrink-0">
              <Smartphone className="h-10 w-10 mb-2 opacity-50" />
              <span className="text-sm font-medium">Phone Image Placeholder</span>
              <span className="text-xs text-muted-foreground mt-1">App Home & Search Screen</span>
            </div>
          </div>

          {/* Sub-grid for Card 2 and Card 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 2: Verified & Secure */}
            <div className="border rounded-2xl p-6 flex flex-col justify-between gap-6 overflow-hidden">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Verified & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Every traveler goes through identity checks to ensure safe and reliable
                  deliveries.
                </p>
              </div>
              {/* Phone Screenshot Placeholder */}
              <div className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
                <ShieldCheck className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">Phone Image Placeholder</span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  Verification & Details
                </span>
              </div>
            </div>

            {/* Card 3: Choose Your Price */}
            <div className="border rounded-2xl p-6 flex flex-col justify-between gap-6 overflow-hidden">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Choose Your Price</h3>
                <p className="text-sm text-muted-foreground">
                  Follow your package journey from handover to final delivery.
                </p>
              </div>
              {/* Offer Card Screenshot Placeholder */}
              <div className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
                <Tag className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">Screenshot Placeholder</span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  Offer & Negotiation Card
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Spans 5 cols on LG) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
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
            <div className="w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <MapPin className="h-10 w-10 mb-2 opacity-50" />
              <span className="text-sm font-medium">Screenshot Placeholder</span>
              <span className="text-xs text-muted-foreground mt-1">Live Tracking Timeline</span>
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
    </section>
  );
}
