# Hero Section Map Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `map-bg.png` as a full-bleed right-anchored background with left-fade and opacity behind the hero section grid.

**Architecture:** Update `HeroSection` in `components/landing/hero-section.tsx` by wrapping the layout in a relative section, embedding a full-bleed absolute background layer for `map-bg.png` with CSS mask gradient fade to the left, and placing hero text/stats in a relative foreground wrapper.

**Tech Stack:** Next.js, React, Tailwind CSS, TypeScript.

## Global Constraints

- Map background must anchor to the right edge of the screen (`right-0`), bypassing container margins and padding.
- Left fade effect must be smooth using CSS `mask-image: linear-gradient` so hero text stays clear.
- Background must scale responsively across mobile, tablet, and desktop display widths.

---

### Task 1: Update HeroSection layout with Map Background

**Files:**

- Modify: [`shiffto-frontend/components/landing/hero-section.tsx`](file:///d:/Codes/work/DataPollex/shiffto/shiffto-frontend/components/landing/hero-section.tsx)

**Interfaces:**

- Consumes: `map-bg.png` from `@/public/map-bg.png`
- Produces: Responsive hero section component with right-aligned map background and left fade effect.

- [ ] **Step 1: Import map background image asset**

In [`components/landing/hero-section.tsx`](file:///d:/Codes/work/DataPollex/shiffto/shiffto-frontend/components/landing/hero-section.tsx), import `mapBg`:

```tsx
import mapBg from '@/public/map-bg.png';
```

- [ ] **Step 2: Restructure section container and add full-bleed map background layer**

Update the `HeroSection` functional component return JSX to wrap content in a relative outer section with the absolute background image layer:

```tsx
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { Button } from '../ui/button';
import userGroup from '@/public/user-group.png';
import truck from '@/public/truck.png';
import check from '@/public/check.png';
import lock from '@/public/lock.png';
import mapBg from '@/public/map-bg.png';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden w-full">
      {/* Full-Bleed Map Background with Opacity and Left Fade */}
      <div className="absolute top-0 right-0 h-full w-full sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[55%] pointer-events-none z-0 opacity-40 sm:opacity-50 select-none [mask-image:linear-gradient(to_right,transparent_0%,black_40%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_40%)]">
        <Image
          src={mapBg}
          alt="World Map Background"
          fill
          priority
          className="object-contain object-right"
        />
      </div>

      {/* Hero Foreground Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Top Hero Layout: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: Headline, Subtitle, and Call to Actions */}
          <div className="flex flex-col gap-6">
            <h1 className="text-[52px] font-bold leading-tight">
              <span className="block">Send Anything.</span>
              <span className="block">Across Borders.</span>
              <span className="block text-accent-foreground">Through People.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Shiffto connects trusted travelers and senders to deliver parcels safely, affordably
              and efficiently
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href={ROUTES.CREATE_SHIPMENT}>
                <Button className="w-[165.5px] px-4 py-3 bg-foreground font-medium rounded-md">
                  Send parcel
                </Button>
              </Link>
              <Link href={ROUTES.CREATE_TRIP}>
                <Button variant="outline" className="px-4 py-3 font-medium rounded-md">
                  Become a traveler
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Empty placeholder slot for Hero graphic */}
          <div></div>
        </div>

        {/* Bottom Stats Banner: 4-Column Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-11 py-7 border rounded-3xl bg-white/80 items-center">
          <div className="flex justify-center items-center gap-3">
            <Image src={userGroup} alt="User Group" className="w-[42px] h-9" />
            <div>
              <h3 className="text-xl font-bold">12K+</h3>
              <p className="text-sm">Verified travelers</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Image src={truck} alt="Truck" className="w-11 h-10" />
            <div>
              <h3 className="text-xl font-bold">25K+</h3>
              <p className="text-sm">Successful deliveries</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Image src={check} alt="Check" className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold">98.7%</h3>
              <p className="text-sm">Delivery success rate</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Image src={lock} alt="Lock" className="w-8 h-[42px]" />
            <div>
              <h3 className="text-xl font-bold">100%</h3>
              <p className="text-sm">Secure Escrow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run Next.js build / typecheck to verify implementation**

Run TypeScript type check or build to ensure zero errors:

```bash
npm run build
```

- [ ] **Step 4: Commit changes**

```bash
git add components/landing/hero-section.tsx docs/superpowers/specs/2026-08-03-hero-map-background-design.md docs/superpowers/plans/2026-08-03-hero-map-background.md
git commit -m "feat(hero): add full-bleed map background with left fade effect"
```
