import Image from 'next/image';
import quickActionPhoneMock from '@/public/quick-action-phone-mock.png';
import shipmentDetailsPhoneMock from '@/public/shipment-details-phone-mock.png';
import offerCardMock from '@/public/offer-card-mock.png';
import shipmentStepsMock from '@/public/shipment-steps-mock.png';

export function FeaturesSection() {
  return (
    <div className="bg-white rounded-t-[100px]">
      <section className="container mx-auto rounded-[100px] p-32 max-w-7xl bg-white flex flex-col gap-20">
        {/* Section Header */}
        <div>
          <h2 className="text-[40px] font-medium tracking-tight leading-none">Our Features</h2>
        </div>

        {/* Main Grid / Stack */}
        <div className="flex flex-col gap-6">
          {/* 1. Global Traveler Network (Full Width Card) */}
          <div className="relative bg-secondary rounded-3xl min-h-[300px] lg:h-[400px] p-8 sm:p-12 lg:px-14 lg:py-0 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Text Content (Capped at 50% width on desktop to prevent overlap) */}
            <div className="w-full lg:w-[50%] max-w-md flex flex-col gap-2 z-10 my-auto">
              <h3 className="font-medium text-[32px] leading-[40px] tracking-[-2px] text-foreground">
                Global Traveler Network
              </h3>
              <p className="font-normal text-sm leading-6 tracking-normal text-[#71717A]">
                Connect with verified travelers heading to your destination from anywhere in the
                world.
              </p>
            </div>

            {/* Right Phone Mock Image (Anchored to bottom-0 so it stays flush with card bottom) */}
            <div className="relative lg:absolute lg:right-[3%] lg:bottom-0 lg:w-[40%] xl:w-[484px] max-w-[484px] z-10 shrink-0 pointer-events-none">
              <Image
                src={quickActionPhoneMock}
                alt="Global Traveler Network"
                width={484}
                height={601}
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* 2-Column Grid Under Global Traveler Network Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Verified & Secure + Choose Your Price */}
            <div className="flex flex-col gap-6">
              {/* 2A. Verified & Secure Container */}
              <div className="bg-secondary rounded-3xl p-10 sm:p-12 flex flex-col justify-between gap-8 overflow-hidden">
                {/* Text Section */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-[28px] leading-[36px] tracking-[-2px] text-foreground">
                    Verified & Secure
                  </h3>
                  <p className="font-normal text-sm leading-6 tracking-normal text-[#71717A]">
                    Every traveler goes through identity checks to ensure safe and reliable
                    deliveries.
                  </p>
                </div>

                {/* Phone Mock Image */}
                <div className="flex justify-start -mb-16">
                  <Image
                    src={shipmentDetailsPhoneMock}
                    alt="Verified & Secure"
                    width={234}
                    height={478}
                    className="h-auto object-contain"
                  />
                </div>
              </div>

              {/* 2C. Choose Your Price Container */}
              <div className="bg-secondary rounded-3xl p-10 sm:p-12 flex flex-col justify-between gap-8 overflow-hidden">
                {/* Text Section */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-[28px] leading-[36px] tracking-[-2px] text-foreground">
                    Choose Your Price
                  </h3>
                  <p className="font-normal text-sm leading-[20px] tracking-normal text-[#71717A]">
                    Follow your package journey from handover to final delivery.
                  </p>
                </div>

                {/* Offer Card Mock Image */}
                <div className="flex justify-start">
                  <Image
                    src={offerCardMock}
                    alt="Choose Your Price"
                    width={274}
                    height={215}
                    className="h-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Faster Shipping + Real-Time Tracking */}
            <div className="flex flex-col gap-6">
              {/* 2B. Faster Shipping Container */}
              <div className="bg-gradient-to-r from-[#FFD95A] via-[#F9F0D1] to-[#FA7F93] rounded-3xl p-10 sm:p-12 flex items-center gap-8 sm:gap-10">
                <span className="font-medium text-[52px] leading-[56px] tracking-[-2px] text-foreground shrink-0">
                  40%
                </span>
                <span className="font-medium text-[28px] leading-[36px] tracking-[-2px] text-foreground max-w-[220px]">
                  Faster than traditional shipping
                </span>
              </div>

              {/* 2D. Real-Time Tracking Container */}
              <div className="bg-secondary rounded-3xl p-10 sm:p-12 flex flex-col justify-between gap-8 overflow-hidden flex-1">
                {/* Shipment Steps Image */}
                <div className="flex justify-center pt-2">
                  <Image
                    src={shipmentStepsMock}
                    alt="Real-Time Tracking"
                    width={308}
                    height={331}
                    className="rounded-lg h-auto object-contain"
                  />
                </div>

                {/* Text Section */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-[28px] leading-[36px] tracking-[-2px] text-foreground">
                    Real-Time Tracking
                  </h3>
                  <p className="font-normal text-sm leading-[20px] tracking-normal text-[#71717A]">
                    Follow your package journey from handover to final delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
