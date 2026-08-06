import { HowItWorksForm } from './how-it-works-form';

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 pt-12 md:pt-20 lg:pt-25 pb-16 md:pb-32 lg:pb-50 max-w-7xl"
    >
      {/* Top Header */}
      <div className="flex flex-col gap-2 mb-12">
        <span className="text-[11px] font-bold tracking-[2.5px] uppercase text-accent-foreground">
          SIMPLE PROCESS
        </span>
        <h2 className="text-[40px] tracking-[-2px]  font-semibold">
          How <span className="text-accent-foreground">Shiffto</span> Works
        </h2>
        <p className="text-[15px] max-w-lg font-normal text-[#6B7280]">
          From sender to receiver in three easy steps — powered by real travellers going your way.
        </p>
      </div>

      {/* Main Content Grid: 2 Columns (Left: 3 Steps, Right: Form Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: 3 Process Steps */}
        <div className="flex flex-col gap-7">
          {/* Step 1 */}
          <div className="flex items-start px-6 py-5.5 gap-5">
            <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white">
              1
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold ">Create a Shipment</h3>
              <p className="font-normal text-sm">
                Post your parcel details — destination, size, weight, and value. Set a budget that
                works for you and let travellers come to you.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start px-6 py-5.5 gap-5">
            <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white">
              2
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold ">Match with a Traveller</h3>
              <p className="font-normal text-sm">
                Browse verified travellers heading to your destination. Review ratings, read
                reviews, choose the best fit, and confirm securely.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start px-6 py-5.5 gap-5">
            <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white">
              3
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold ">Track the Delivery</h3>
              <p className="font-normal text-sm">
                Real-time updates at every checkpoint. Payment held in escrow and only releases once
                your parcel is delivered safely.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Separate Client Form Component */}
        <HowItWorksForm />
      </div>
    </section>
  );
}
