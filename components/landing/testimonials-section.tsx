'use client';

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
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    quote:
      'I had extra luggage space on my trip to London, so I accepted a delivery request through Shiftto. The process was straightforward, and I earned extra money from a trip I was already taking.',
    name: 'Daniel White',
    role: 'Traveler',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    quote:
      'The platform made it simple to compare offers and communicate with travelers. I always knew where my package was, and it arrived exactly as expected.',
    name: 'Samantha Lee',
    role: 'Sender',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    quote:
      'I was initially hesitant about using a traveler-based delivery service, but the verification process and communication features gave me confidence. Everything went smoothly from pickup to delivery.',
    name: 'Jordan Kim',
    role: 'Sender',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    quote:
      'As a frequent international traveler, Shiftto allows me to monetize unused baggage weight easily while helping people send urgent gifts to family.',
    name: 'Maria Garcia',
    role: 'Traveler',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    quote:
      'I sent important documents from Sydney to Singapore within two days. The live updates and secure handover gave me complete peace of mind throughout.',
    name: 'Liam Chen',
    role: 'Sender',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    quote:
      'Traveling between Tokyo and San Francisco quarterly, Shiftto has turned my spare suitcase allowance into a reliable extra income stream on every flight.',
    name: 'Sophia Patel',
    role: 'Traveler',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    quote:
      'Finding a traveler who was already heading to Berlin saved me hundreds of dollars compared to traditional express shipping services.',
    name: 'Marcus Vance',
    role: 'Sender',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
  },
];

export function TestimonialsSection() {
  return (
    <section className="w-full bg-secondary flex flex-col gap-12 py-[80px] px-6 lg:px-[128px]">
      {/* Header */}
      <div className="flex flex-col gap-[12px]">
        <span className="font-normal text-sm leading-[20px] tracking-[0px] align-middle text-[#ABABAB] uppercase">
          TESTIMONIALS
        </span>
        <h2 className="font-medium text-[40px] leading-[48px] tracking-[-2px] align-middle text-foreground">
          Trusted by Travelers Worldwide
        </h2>
        <p className="font-normal text-base leading-[24px] tracking-[0px] align-middle text-[#71717A]">
          See what designers and developers are saying about their experience with Palm UI.
        </p>
      </div>

      {/* Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full flex flex-col gap-12"
      >
        <CarouselContent className="-ml-3">
          {TESTIMONIALS.map((item, index) => {
            const isFirst = index === 0;

            return (
              <CarouselItem
                key={item.id}
                className="pl-3 basis-full sm:basis-1/2 md:basis-[300px] lg:basis-[300px] shrink-0"
              >
                <div
                  className={`rounded-[12px] p-[32px] h-[360px] flex flex-col justify-between gap-6 shadow-[0px_2px_6px_0px_#1018280F] ${
                    isFirst ? 'bg-gradient-to-br from-[#FD6512] to-[#FD651200]' : 'bg-white'
                  }`}
                >
                  <p
                    className={`font-normal text-base leading-[24px] tracking-[0px] align-middle ${
                      isFirst ? 'text-white' : 'text-[#71717A]'
                    }`}
                  >
                    &ldquo;{item.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-[32px] h-[32px] rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col text-left">
                      <span
                        className={`font-medium text-base leading-[18px] tracking-[0px] align-middle ${
                          isFirst ? 'text-foreground' : 'text-primary'
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="font-normal text-sm leading-[20px] tracking-[0px] align-middle text-[#71717A]">
                        {item.role}
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-[8px]">
          <CarouselPrevious className="static translate-y-0 h-[32px] w-[32px] p-[8px] bg-white hover:bg-white/90 border-none shadow-none text-primary" />
          <CarouselNext className="static translate-y-0 h-[32px] w-[32px] p-[8px] bg-white hover:bg-white/90 border-none shadow-none text-primary" />
        </div>
      </Carousel>
    </section>
  );
}
