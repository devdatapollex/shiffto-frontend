import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/routes';
import { User, ChevronRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="relative overflow-hidden rounded-3xl min-h-[380px] flex items-center justify-center p-8 sm:p-12 text-center">
        {/* Background Image from Public / Unsplash */}
        <Image
          src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1600&auto=format&fit=crop"
          alt="Airport Traveler Background"
          fill
          className="object-cover"
          priority
        />

        {/* Card Overlay Content */}
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6 p-8 sm:p-12 rounded-2xl border bg-background/85 backdrop-blur-md">
          {/* Overlapping User Avatars */}
          <div className="flex -space-x-3 items-center">
            <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Connect, Ship, and Save</h2>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-lg">
            Turn unused luggage space into opportunity and discover a faster, more affordable way to
            ship internationally.
          </p>

          {/* CTA Action Button */}
          <Link href={ROUTES.REGISTER}>
            <button
              type="button"
              className="px-6 py-3 font-semibold rounded-xl bg-primary text-primary-foreground flex items-center gap-2"
            >
              Get started <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
