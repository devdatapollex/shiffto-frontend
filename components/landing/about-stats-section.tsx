import Image from 'next/image';
import userGroup from '@/public/user-group.png';
import truck from '@/public/truck.png';
import check from '@/public/check.png';
import lock from '@/public/lock.png';

export function AboutStatsSection() {
  return (
    <section className="w-full bg-white border-y border-border py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-16 shadow-[0px_4px_20px_-2px_#10182808]">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-center">
        <div className="flex items-center gap-4 p-2 sm:p-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#FFF5EF] p-2.5">
            <Image
              src={userGroup}
              alt="Verified travelers"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">12K+</h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium whitespace-nowrap">
              Verified travelers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-2 sm:p-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#FFF5EF] p-2.5">
            <Image
              src={truck}
              alt="Successful deliveries"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">29K+</h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium whitespace-nowrap">
              Successful deliveries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-2 sm:p-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#FFF5EF] p-2.5">
            <Image src={check} alt="Delivery success rate" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">98.7%</h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium whitespace-nowrap">
              Delivery success rate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-2 sm:p-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#FFF5EF] p-2.5">
            <Image src={lock} alt="Secure Escrow" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">100%</h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium whitespace-nowrap">
              Secure Escrow
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
