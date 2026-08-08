import { Shield, Coins, Users, Eye } from 'lucide-react';

const VALUES = [
  {
    title: 'Trust First',
    description:
      'Every traveler and sender is identity verified. We build a layer of trust into every step of the process.',
    icon: Shield,
    bgColor: 'bg-[#FFF2EE]',
    iconColor: 'text-[#F05336]',
  },
  {
    title: 'Affordable Access',
    description:
      'By using space that is already moving on trips, we make cross-border shipping dramatically cheaper for everyone.',
    icon: Coins,
    bgColor: 'bg-[#EFF6FF]',
    iconColor: 'text-[#2563EB]',
  },
  {
    title: 'Community Driven',
    description:
      'Shiffto thrives on the connections between real people. Reviews, ratings, and shared experiences build a safer platform.',
    icon: Users,
    bgColor: 'bg-[#ECFDF5]',
    iconColor: 'text-[#10B981]',
  },
  {
    title: 'Full Transparency',
    description:
      'Real-time tracking, clear upfront fees, escrow-backed payments, and open communication mean nothing is left to chance.',
    icon: Eye,
    bgColor: 'bg-[#F3E8FF]',
    iconColor: 'text-[#9333EA]',
  },
];

export function AboutValuesSection() {
  return (
    <section className="w-full bg-white py-16 md:py-24 px-5 sm:px-8 md:px-12 lg:px-20 xl:px-32">
      <div className="container mx-auto max-w-7xl flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold tracking-[2.5px] uppercase text-[#F05336]">
            WHAT DRIVES US
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-1px] text-foreground">
            Our Core Values
          </h2>
        </div>

        {/* 2x2 Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((val) => {
            const IconComponent = val.icon;
            return (
              <div
                key={val.title}
                className="flex flex-col gap-3.5 p-6 sm:p-8 rounded-2xl border border-gray-100 bg-[#FAFAFA] hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${val.bgColor}`}
                >
                  <IconComponent className={`w-6 h-6 ${val.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground">{val.title}</h3>
                <p className="text-sm text-[#71717A] leading-relaxed font-normal">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
