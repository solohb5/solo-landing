# 🎯 FOCUS BOARD — Solo Canvas

**What we're working on TODAY. Nothing else.**

---

## Current Focus

**STATUS: 🔵 IN PROGRESS — Complete Rebuild**

**Task:** Rebuild the site with "Stillness + Heartbeat" philosophy

**Philosophy:** Everything is still. One thing is alive. That's enough.

---

## The Rebuild (Dec 21, 2024)

### What We're Building

A single-page landing site where:
- The ONLY animation is the pulsing gold square (heartbeat)
- Everything else is static, typography-forward, premium
- No morphing blob, no scroll animations, no custom cursor
- Pure restraint and craft

### The Heartbeat

The square in "SOLO▪" pulses like a heartbeat at 1.2s (50 BPM):
- Subtle gold glow
- Appears in logo, section numbers, and as persistent element
- On hover: rotates 45° to become diamond

### Page Structure

1. **Hero** (100vh) — Logo + "Finally." + scroll indicator
2. **Section 01: The Truth** — "You've built something real..."
3. **Section 02: The Way** — Process (one conversation, two weeks)
4. **Section 03: The Proof** — Jovanny case study with browser mockup
5. **Section 04: The Door** — CTA "Begin →"
6. **Footer** — Logo + email, that's it

---

## Design System

| Role | Color |
|------|-------|
| Background | #1A1A1A (charcoal) |
| Primary text | #F5F2EB (warm cream) |
| Secondary | #8A8780 (stone) |
| Accent | #C9A227 (gold) |

| Font | Usage |
|------|-------|
| Cormorant Garamond 300/400 | Headlines, hero |
| Inter 400/500 | Body, UI |

---

## What Does NOT Exist

- Navigation/hamburger
- Morphing blob
- Scroll animations
- Custom cursor
- Contact form
- Social icons
- Loading screen
- Parallax
- Carousels

---

## Tasks

- [ ] Update boards ← NOW
- [ ] Rebuild home.tsx (minimal structure)
- [ ] New index.css (exact design system)
- [ ] Heartbeat animation
- [ ] Hover diamond rotation
- [ ] Browser mockup section
- [ ] Mobile + accessibility

---

## Assets Ready

| Asset | Location | Status |
|-------|----------|--------|
| solo-logo-light.svg | client/src/assets/logos/ | ✅ Ready |
| solo-logo-dark.svg | client/src/assets/logos/ | ✅ Ready |
| solo-square.svg | client/src/assets/logos/ | ✅ Ready (change fill to gold) |
| jovanny-screenshot.png | — | ⏳ Hans to provide |

---

## How to Run

```bash
cd Solo-Canvas
npm run dev
```

Then visit `http://localhost:3000`
