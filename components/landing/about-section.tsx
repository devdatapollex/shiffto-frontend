import { Image as ImageIcon } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Illustration / Image Placeholder */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full h-80 sm:h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
            <span className="text-base font-medium">Illustration Placeholder</span>
            <span className="text-xs text-muted-foreground mt-1 max-w-xs">
              Traveler with luggage, signpost, and airplane illustration
            </span>
          </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight">About Us</h2>

          <div className="flex flex-col gap-4 text-base text-muted-foreground leading-relaxed">
            <p>
              Shiftto is an innovative peer-to-peer delivery platform that seamlessly connects
              travelers with individuals looking to send packages across international borders. By
              leveraging the available luggage space on real journeys, we make cross-border shipping
              not only more affordable but also flexible and personal.
            </p>
            <p>
              Our mission is to cultivate a trusted community where every delivery is verified,
              tracked, and treated with utmost care, ensuring that sending something abroad feels as
              effortless as sharing a trip with a friend.
            </p>
            <p>
              Join us in revolutionizing the way we perceive shipping and travel, and experience the
              joy of connecting with others through your journeys!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
