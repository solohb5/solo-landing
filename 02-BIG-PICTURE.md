# 🗺️ BIG PICTURE — Solo Canvas

**The vision. Simple and focused.**

---

## What Is This?

**One-liner:** A premium landing page for Solo Designs — where high-performers book design consultations.

**The Problem:** You need a place to send potential clients that immediately communicates your value.

**The User:** High-performers, founders, professionals who want their digital presence to match their expertise. They arrive from "BY SOLO DESIGNS" links in client site footers (e.g., theedgeofhonor.com) — they've already seen the quality of work.

**The Vision:** A page so stunning that designers screenshot it for inspiration. It should make booking a conversation feel inevitable.

---

## The Aesthetic

The blob is the centerpiece — a living, breathing generative art piece that:
- Morphs between human silhouettes (representing clients being transformed)
- Changes colors organically (blue → teal → green, continuous drift)
- Responds to mouse movement and scroll
- Feels premium, artistic, not template-y

**Key Message:** "We don't make websites. We create digital legacies."

---

## Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Morphing Blob | WebGL canvas with silhouette morphing | ✅ Done |
| 3 Silhouettes | Man portrait, front-facing, celebrate | ✅ Done |
| Color Transitions | Blue → Teal → Green organic drift | ✅ Done |
| Hero Section | "Story-driven design" + "Let's build your digital legacy" | ✅ Done |
| Quote Section | Scrolling reveal animation | ✅ Done |
| Booking Dialog | Contact form with Formspree | ✅ Done |
| Mobile Responsive | Works on all devices | ✅ Done |
| Custom Cursor | Context-aware cursor with magnetic buttons | ✅ Done |

---

## Tech Stack

```
Language:     TypeScript
Framework:    React 19 + Vite
Backend:      Express
Styling:      Tailwind CSS 4
Animation:    Framer Motion + Canvas/WebGL
Generative:   SimplexNoise for organic movement
UI:           Radix + shadcn/ui
Hosting:      Vercel (vercel.json configured)
```

---

## What's Left

### Phase 1: Launch (NOW)
- [ ] Push to Git
- [ ] Deploy to Vercel

### Phase 2: Polish (Optional)
- [ ] Horizontal flip silhouettes for more variety
- [ ] Add 1-2 more silhouettes
- [ ] Calendly integration
- [ ] Custom domain setup

---

## Key Decisions

| Decision | Reasoning | Date |
|----------|-----------|------|
| Morphing blob over static image | Differentiates from templates, feels alive | Dec 2024 |
| 3 energies (professional, direct, celebratory) | Represents client transformation journey | Dec 2024 |
| 88% morph | Human recognizable but still organic/artistic | Dec 2024 |
| Remove "The Work" section | Visitors already saw portfolio on client sites | Dec 2024 |
| No pigeonholing copy | Appeals to anyone wanting premium digital presence | Dec 2024 |

---

## Files to Know

| File | Purpose |
|------|---------|
| `client/src/pages/home.tsx` | Main page with MorphingBlob, hero, sections |
| `client/src/assets/silhouettes/*.svg` | SVG silhouettes for morphing |
| `client/src/index.css` | Global styles, animations |
| `vercel.json` | Deployment config |

