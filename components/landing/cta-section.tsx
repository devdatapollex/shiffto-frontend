import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ctaBg from '@/public/CTA backgroud image.jpg';

export function CTASection() {
  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center justify-center gap-[40px] py-[64px] px-4 md:px-16 lg:px-[128px]">
      {/* CTA Background Image */}
      <Image src={ctaBg} alt="CTA background image" fill className="object-cover" priority />

      {/* Inner Container */}
      <div className="relative z-10 w-full max-w-[1184px] mx-auto flex flex-col items-center justify-center text-center rounded-[16px] py-[80px] px-[20px] bg-[#D14E6499] backdrop-blur-[36px] gap-[40px]">
        {/* Avatar and Title-Subtitle Section Container */}
        <div className="flex flex-col items-center gap-[20px] max-w-[600px] w-full">
          {/* Avatar Section using shadcn AvatarGroup */}
          <AvatarGroup className="-space-x-2">
            <Avatar className="w-[40px] h-[40px] border border-white">
              <AvatarImage
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="User 1"
                className="object-cover"
              />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar className="w-[40px] h-[40px] border border-white">
              <AvatarImage
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="User 2"
                className="object-cover"
              />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar className="w-[40px] h-[40px] border border-white">
              <AvatarImage
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="User 3"
                className="object-cover"
              />
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
          </AvatarGroup>

          {/* Title Subtitle Container */}
          <div className="flex flex-col items-center gap-[12px]">
            {/* Title */}
            <h2 className="font-medium text-[32px] leading-[40px] tracking-[-2px] text-white">
              Connect, Ship, and Save
            </h2>

            {/* Subtitle */}
            <p className="font-normal text-[16px] leading-[24px] tracking-normal text-[#F5F5F5] max-w-[540px]">
              Turn unused luggage space into opportunity and discover a faster, more affordable way
              to ship internationally.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          className="bg-foreground text-white hover:bg-foreground/90 font-medium px-6 py-3 h-auto rounded-md gap-2 text-sm cursor-pointer"
        >
          <Link href={ROUTES.REGISTER}>
            Get started <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
