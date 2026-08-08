'use client';

import { ShieldCheck, DollarSign, Star, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function HowItWorksView() {
  return (
    <section className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 pt-8 md:pt-12 pb-16 md:pb-24 max-w-7xl">
      <Tabs defaultValue="sender" className="w-full flex flex-col items-center">
        {/* Top Main Section Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8 sm:mb-12">
          <span className="text-[12px] font-semibold text-primary">Simple Process</span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] leading-12 tracking-[-2px] font-medium text-foreground">
            How <span className="text-[#F6677D]">Shiffto</span> Works
          </h1>
          <p className="text-sm sm:text-base max-w-xl text-[#404040] font-medium leading-6">
            Whether you want to send a parcel or earn money while you travel, it only takes a few
            steps.
          </p>

          {/* Shadcn Tabs List */}
          <TabsList className="p-1 bg-white rounded-2xl border border-[#F3F4F6] shadow-[0_2px_12px_rgba(15,61,145,0.08)] mt-4 min-w-[315px] min-h-[50px]">
            <TabsTrigger
              value="sender"
              className="px-8 py-3 rounded-xl min-h-[40px] min-w-[147px] text-sm font-bold transition-none cursor-pointer text-[#404040] hover:text-muted-foreground data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#FD6512] data-[state=active]:to-[#F6677D] data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(246,103,125,0.35)]"
            >
              I&apos;m a Sender
            </TabsTrigger>
            <TabsTrigger
              value="traveler"
              className="px-8 py-3 rounded-xl min-h-[40px] min-w-[147px] text-sm  font-bold transition-none cursor-pointer text-[#404040] hover:text-muted-foreground data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#FD6512] data-[state=active]:to-[#F6677D] data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(246,103,125,0.35)]"
            >
              For Traveler
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Sender Tab Content */}
        <TabsContent value="sender" className="w-full">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            {/* Left Column: For Senders Header & 3 Process Steps */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <div className="flex flex-col gap-1 mb-2 min-h-[88px] justify-end">
                <span className="text-xs font-semibold text-accent-foreground">For Senders</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Send anything, anywhere
                </h2>
                <p className="text-sm text-muted-foreground">
                  Three simple steps to get your parcel moving across borders
                </p>
              </div>

              {/* Step 1 */}
              <div className="flex items-center p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4 sm:gap-5 min-h-[120px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white text-base">
                  1
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="text-lg font-bold text-foreground">Create a Shipment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Post your parcel details — destination, size, weight, and value. Set a budget that works for you and let travellers come to you.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4 sm:gap-5 min-h-[120px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white text-base">
                  2
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="text-lg font-bold text-foreground">Match with a Traveler</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Browse verified travellers heading to your destination. Review ratings, read reviews, choose the best fit, and confirm securely.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4 sm:gap-5 min-h-[120px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white text-base">
                  3
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="text-lg font-bold text-foreground">Track the Delivery</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Real-time updates at every checkpoint. Payment held in escrow and only releases once your parcel is delivered safely.
                  </p>
                </div>
              </div>
            </div>            {/* Right Column: Blue Hero Card & Key Benefits Grid */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between gap-6">
              {/* Blue Banner Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3D91] via-[#1A56C4] to-[#2563EB] p-7 sm:p-8 text-white flex flex-col justify-between min-h-[250px] lg:h-1/2 shadow-lg">
                {/* Background accent wave/circles */}
                <div className="absolute -top-12 -right-30 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-20 -left-25 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full gap-2">
                  <div className="flex flex-col gap-2 min-h-[112px]">
                    <span className="text-xs font-medium text-[#FBB6C1]">Why Senders Love Us</span>
                    <h3 className="text-xl sm:text-2xl font-semibold leading-[32px] tracking-[-1px] text-white">
                      Ship smarter, not harder
                    </h3>
                    <p className="text-sm text-[#E5E5E5] leading-[20px] font-normal mt-2">
                      Skip expensive couriers. Connect with real people already heading your way.
                    </p>
                  </div>
                  {/* Inner highlight pill */}
                  <div className="relative z-10 mt-6 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 min-h-[64px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6677D] text-white">
                      <Star className="w-5 h-5 fill-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Trusted by 32k+ senders</span>
                      <span className="text-xs text-[#BEDBFF] leading-[20px]">
                        Packages delivered globally every week
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Benefits Grid */}
              <div className="flex flex-col justify-between gap-3">
                <span className="text-xs font-semibold text-[#F48FA0]">
                  Key Benefits
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Affordable Rates</h4>
                    <p className="text-xs text-muted-foreground">Save vs. traditional couriers</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Verified Travelers</h4>
                    <p className="text-xs text-muted-foreground">Identity-checked community</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Secure Escrow</h4>
                    <p className="text-xs text-muted-foreground">Pay only on delivery</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Real-Time Tracking</h4>
                    <p className="text-xs text-muted-foreground">Know where your parcel is</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Traveler Tab Content */}
        <TabsContent value="traveler" className="w-full">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            {/* Left Column: For Travelers Header & 3 Process Steps */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <div className="flex flex-col gap-1 mb-2 min-h-[88px] justify-end">
                <span className="text-xs font-semibold text-accent-foreground">
                  For Travelers
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Travel and earn along the way
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your simple steps to turn your trip into an earning opportunity.
                </p>
              </div>

              {/* Step 1 */}
              <div className="flex items-center p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4 sm:gap-5 min-h-[120px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white text-base">
                  1
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="text-lg font-bold text-foreground">Add Your Trip</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Log your upcoming travel — route, dates, and available luggage space. It only takes a minute to list your trip.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4 sm:gap-5 min-h-[120px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white text-base">
                  2
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="text-lg font-bold text-foreground">Receive Delivery Requests</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Senders whose packages match your route will send you requests. Review details, negotiate if needed, and choose what fits your plans.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4 sm:gap-5 min-h-[120px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBB6C1] to-[#F48FA0] font-bold text-white text-base">
                  3
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="text-lg font-bold text-foreground">
                    Accept & Deliver to Get Paid
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Confirm the request, collect the parcel, and deliver it to the recipient. Once confirmed, funds are released straight to your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Blue Hero Card & Key Benefits Grid */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between gap-6">
              {/* Blue Banner Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3D91] via-[#1A56C4] to-[#2563EB] p-7 sm:p-8 text-white flex flex-col justify-between min-h-[250px] lg:h-1/2 shadow-lg">
                {/* Background accent wave/circles */}
                <div className="absolute -top-12 -right-30 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-20 -left-25 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full gap-2">
                  <div className="flex flex-col gap-2 min-h-[112px]">
                    <span className="text-xs font-medium text-[#FBB6C1]">Why Travelers Love Us</span>
                    <h3 className="text-xl sm:text-2xl font-semibold leading-[32px] tracking-[-1px] text-white">
                      Your trip, your schedule, your rules
                    </h3>
                    <p className="text-sm text-[#E5E5E5] leading-[20px] font-normal mt-2">
                      No extra trips, no commitments. Earn on routes you&apos;re already flying.
                    </p>
                  </div>

                  {/* Inner highlight pill */}
                  <div className="relative z-10 mt-6 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 min-h-[64px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6677D] text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Avg. $120 extra per trip</span>
                      <span className="text-xs text-[#BEDBFF] leading-[20px]">
                        Join 15k+ active travellers
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Benefits Grid */}
              <div className="flex flex-col justify-between gap-3">
                <span className="text-xs font-semibold text-[#F48FA0]">
                  Key Benefits
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Extra Income</h4>
                    <p className="text-xs text-muted-foreground">Earn money on trips you&apos;re already taking</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Flexible Requests</h4>
                    <p className="text-xs text-muted-foreground">Accept only what suits you</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Safe Platform</h4>
                    <p className="text-xs text-muted-foreground">Funds held until delivery confirmed</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FDE8D3] flex flex-col justify-center gap-1 min-h-[76px]">
                    <h4 className="text-sm font-bold text-foreground">Active Community</h4>
                    <p className="text-xs text-muted-foreground">Build trusted reputation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
