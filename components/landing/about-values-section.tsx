import { Users, Eye, ShieldCheck, CircleDollarSign } from 'lucide-react';

const VALUES = [
  {
    title: 'Trust First',
    description:
      'Every traveller and sender is identity-verified. We built a layer of trust into every step of the process.',
    cardBgColor: 'bg-secondary',
    borderColor: 'border-[#FDE8D3]',
    icon: ShieldCheck,
    bgColor: 'bg-[#F16B2118]',
    iconColor: 'text-[#F05336]',
  },
  {
    title: 'Affordable Access',
    description:
      'By using space that already exists on real trips, we make cross-border shipping dramatically cheaper for everyone.',
    cardBgColor: 'bg-[#EFF6FF]',
    borderColor: 'border-[#BFDBFE]',
    icon: CircleDollarSign,
    bgColor: 'bg-[#0F3D9118]',
    iconColor: 'text-[#0F3D91]',
  },
  {
    title: 'Community Driven',
    description:
      'Shiffto thrives on the connections between real people. Ratings, reviews, and shared experiences build a better platform.',
    cardBgColor: 'bg-[#F0FDF4]',
    borderColor: 'border-[#BBF7D0]',
    icon: Users,
    bgColor: 'bg-[#16A34A18]',
    iconColor: 'text-[#10B981]',
  },
  {
    title: 'Full Transparency',
    description:
      'Real-time tracking, escrow-protected payments, and open communication mean nothing is left to chance.',
    cardBgColor: 'bg-[#FDF4FF]',
    borderColor: 'border-[#E9D5FF]',
    icon: Eye,
    bgColor: 'bg-[#7C3AED18]',
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
                className={`flex flex-col gap-3.5 p-6 sm:p-8 rounded-2xl border ${val.borderColor} ${val.cardBgColor} hover:shadow-md transition-shadow`}
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
