'use client';

import { User } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      'I needed to send a package from Toronto to Dhaka, and the courier rates were surprisingly high. Through Shiftto, I found a traveler on the same route and got my package delivered smoothly at a much lower cost.',
    name: 'Alex Carter',
    role: 'Sender',
    isFeatured: true,
  },
  {
    id: 2,
    quote:
      'I had extra luggage space on my trip to London, so I accepted a delivery request through Shiftto. The process was straightforward, and I earned extra money from a trip I was already taking.',
    name: 'Daniel White',
    role: 'Traveler',
    isFeatured: false,
  },
  {
    id: 3,
    quote:
      'The platform made it simple to compare offers and communicate with travelers. I always knew where my package was, and it arrived exactly as expected.',
    name: 'Samantha Lee',
    role: 'Sender',
    isFeatured: false,
  },
  {
    id: 4,
    quote:
      'I was initially hesitant about using a traveler-based delivery service, but the verification process and communication features gave me confidence. Everything went smoothly from pickup to delivery.',
    name: 'Jordan Kim',
    role: 'Sender',
    isFeatured: false,
  },
  {
    id: 5,
    quote:
      'As a frequent international traveler, Shiftto allows me to monetize unused baggage weight easily while helping people send urgent gifts to family.',
    name: 'Maria Garcia',
    role: 'Traveler',
    isFeatured: false,
  },
];

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          TESTIMONIALS
        </span>
        <h2 className="text-3xl font-bold tracking-tight">Trusted by Travelers Worldwide</h2>
        <p className="text-base text-muted-foreground">
          See what senders and travelers are saying about their experience with Shiftto.
        </p>
      </div>

      {/* Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {TESTIMONIALS.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="border rounded-2xl p-6 h-full flex flex-col justify-between gap-6 bg-background">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">{item.role}</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 mt-6">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </section>
  );
}
