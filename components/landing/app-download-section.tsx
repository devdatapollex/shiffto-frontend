import { Smartphone, Monitor, Tablet } from 'lucide-react';

export function AppDownloadSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl flex flex-col items-center text-center gap-8">
      {/* Header Content */}
      <div className="flex flex-col gap-3 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight">Available on all your devices</h2>
        <p className="text-base text-muted-foreground">
          Experience Shiftto from anywhere, anytime. Shiftto is available across laptop, tablet and
          mobile phones
        </p>
      </div>

      {/* App Store / Play Store Badges / Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Google Play Button */}
        <button className="border rounded-xl px-5 py-2.5 flex items-center gap-3 bg-background hover:bg-accent transition-colors">
          <div className="text-left leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              GET IT ON
            </div>
            <div className="text-sm font-semibold">Google Play</div>
          </div>
        </button>

        {/* App Store Button */}
        <button className="border rounded-xl px-5 py-2.5 flex items-center gap-3 bg-background hover:bg-accent transition-colors">
          <div className="text-left leading-tight">
            <div className="text-[10px] tracking-wider text-muted-foreground font-medium">
              Download on the
            </div>
            <div className="text-sm font-semibold">App Store</div>
          </div>
        </button>
      </div>

      {/* Device Screens Mockup Placeholder Container */}
      <div className="w-full max-w-5xl mt-4">
        <div className="w-full h-80 sm:h-[420px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="flex items-center gap-4 mb-3 opacity-50">
            <Smartphone className="h-10 w-10" />
            <Monitor className="h-14 w-14" />
            <Tablet className="h-12 w-12" />
          </div>
          <span className="text-base font-medium">Device Mockups Placeholder</span>
          <span className="text-xs text-muted-foreground mt-1 max-w-sm">
            Responsive app screens across Laptop, Tablet, and Mobile phone devices
          </span>
        </div>
      </div>
    </section>
  );
}
