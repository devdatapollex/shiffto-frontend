# Hero Section Map Background Design Specification

## Overview

Add `map-bg.png` as a full-bleed right-anchored background behind the 2-column grid in `HeroSection` ([`hero-section.tsx`](file:///d:/Codes/work/DataPollex/shiffto/shiffto-frontend/components/landing/hero-section.tsx)). The background will extend to the rightmost edge of the screen outside container margins/paddings, apply a smooth gradient fade to transparent on the left, and adjust responsively across display sizes.

## Structural Changes & Styling

### 1. Parent Wrapper

- Wrap the hero section elements in an outer relative section:
  ```tsx
  <section className="relative overflow-hidden w-full">
  ```

### 2. Full-Bleed Map Background Container

- Positioned absolutely on the right edge:
  ```tsx
  <div className="absolute top-0 right-0 h-full w-full sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[55%] pointer-events-none z-0 opacity-40 sm:opacity-50 select-none [mask-image:linear-gradient(to_right,transparent_0%,black_40%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_40%)]">
    <Image
      src={mapBg}
      alt="World Map Background"
      fill
      priority
      className="object-contain object-right"
    />
  </div>
  ```

### 3. Foreground Content Section

- Wrap existing hero grid and stats banner in a container with `relative z-10`:
  ```tsx
  <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
    {/* Grid & Stats Banner */}
  </div>
  ```

## Responsive Behavior & Edge Cases

- **Screen Edges**: The background layer anchors to `right-0` on the outer `w-full` section, allowing it to stretch past container paddings all the way to the browser window's right edge.
- **Text Legibility**: The left-fading mask gradient (`transparent 0%` to `black 40%`) guarantees that the map image completely dissolves before overlapping with the text content on the left column.
- **Breakpoint Adaptability**: The container width scales dynamically (`w-full` on mobile up to `55%` on ultra-wide screens), ensuring the map remains balanced and well-proportioned across mobile, tablet, and desktop screens.
