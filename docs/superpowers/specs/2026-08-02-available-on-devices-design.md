# Design Specification: Available on all your devices section

## 1. Overview & Goal

Implement the "Available on all your devices" landing page section in `components/landing/app-download-section.tsx` according to the provided design mockups and exact typography/spacing specs.

## 2. Section Component Structure

- **File**: `components/landing/app-download-section.tsx`
- **Main Section Wrapper**:
  - `bg-white`
  - Gap: `22px` (`gap-[22px]`)
  - Padding: `px-6 py-16 lg:p-[128px]` (Responsive scaling down to `px-6 py-16` on mobile, `128px` on desktop)
  - `flex flex-col items-center text-center w-full`

- **Text Content Container**:
  - Container Gap: `24px` (`gap-6`)
  - `flex flex-col items-center text-center max-w-3xl`
  - **Title**:
    - Text: `"Available on all your devices"`
    - Font Family: `'Poppins', sans-serif`
    - Font Weight: `medium` (`font-medium` / 500)
    - Font Size: `text-4xl sm:text-5xl lg:text-[60px]`
    - Line Height: `leading-[1.1]` or `leading-[72px]`
    - Letter Spacing: `tracking-tight`
    - Text Color: `text-foreground`
  - **Description Text**:
    - Text: `"Experience Shiftto from anywhere, anytime. Shiftto is available across laptop, tablet and mobile phones"`
    - Font Family: `'Poppins', sans-serif`
    - Font Weight: `normal` (`font-normal` / 400)
    - Font Size: `text-base` (16px)
    - Line Height: `leading-[24px]`
    - Letter Spacing: `tracking-normal`
    - Text Color: `text-foreground` / `text-[#71717A]` (consistent with brand description color)

- **Store Icons Section**:
  - Container Gap: `24px` (`gap-6`)
  - `flex flex-wrap items-center justify-center gap-6`
  - Badges / Buttons using Next.js `Image` component:
    - `/play-store icon.png` (`width={160}`, `height={48}`)
    - `/app-store icon.png` (`width={160}`, `height={48}`)
  - Interactive hover state and cursor pointer links.

- **Coupled Mocks Layout**:
  - Relative container with precise percentage positioning to couple laptop, iPhone, and tablet mocks:
    - **Laptop Mock** (`laptop mock.png`): Center backdrop anchor (`w-full max-w-[900px] h-auto object-contain`).
    - **iPhone Mock** (`iphone mock.png`): Bottom-left position (`absolute left-[2%] -bottom-[4%] w-[25%] sm:w-[22%] max-w-[200px] z-20 drop-shadow-2xl`).
    - **Tablet Mock** (`tablet mock.png`): Bottom-right position (`absolute right-[0%] -bottom-[4%] w-[48%] sm:w-[45%] max-w-[420px] z-10 drop-shadow-2xl`).
  - Ensures clean fluid scaling across mobile, tablet, and wide desktop screens without breaking aspect ratio or overflow.

## 3. Scope & Background Gradient Note

Per user instruction, background gradient styling is explicitly deferred for a later task.
