import { HowItWorksForm } from './how-it-works-form';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col gap-2 mb-12">
        <span className="text-xs font-semibold tracking-wider uppercase">SIMPLE PROCESS</span>
        <h2 className="text-3xl font-bold sm:text-4xl">How Shiffto Works</h2>
        <p className="text-lg max-w-2xl">
          From sender to receiver in three easy steps — powered by real travellers going your way.
        </p>
      </div>

      {/* Main Content Grid: 2 Columns (Left: 3 Steps, Right: Form Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: 3 Process Steps */}
        <div className="flex flex-col gap-8">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-bold">
              1
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">Create a Shipment</h3>
              <p>
                Post your parcel details — destination, size, weight, and value. Set a budget that
                works for you and let travellers come to you.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-bold">
              2
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">Match with a Traveller</h3>
              <p>
                Browse verified travellers heading to your destination. Review ratings, read
                reviews, choose the best fit, and confirm securely.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-bold">
              3
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">Track the Delivery</h3>
              <p>
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
