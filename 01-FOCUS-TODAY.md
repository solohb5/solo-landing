# 🎯 FOCUS BOARD — Solo Canvas

**Last Updated:** December 22, 2024

---

## Current Status: ✅ COMPLETE — Ready for Launch

The site is fully built, functional, and deployed. All core features are working.

---

## What's Live

### Pages & Sections
- **Hero** — "WE BUILD WEBSITES THAT TELL YOUR STORY" with hollow "STORY" effect (fills on hover)
- **Section 01** — "You are the brand" with spotlight text effect
- **Section 02** — Strikethrough reveals + "Custom used to mean $20K. Not anymore."
- **Section 03** — "With one conversation" + "THEN WE GO TO WORK" (hollow-to-fill on hover)
- **Gallery** — Horizontal scroll with Jovanny Jones case study + placeholder card
- **CTA Section** — "Your story deserves better than a template"
- **Footer** — Editorial 3-column layout with pulsing logo

### Interactive Features
- ✅ Color mode cycling (Gold → Forest → Ocean → Light) via top-left square
- ✅ Form modal ("Let's build") connected to Formspree
- ✅ Pulsing heartbeat squares throughout
- ✅ Custom cursor
- ✅ Preloader with word-by-word reveal
- ✅ Page border
- ✅ Smooth scroll (Lenis)
- ✅ Mobile responsive

### Deployments
- **Local:** `npm run dev` → http://localhost:3000
- **Production:** Vercel (auto-deploys from GitHub main branch)
- **Repo:** github.com/solohb5/solo-landing

---

## Important URLs & Services

| Service | URL | Purpose |
|---------|-----|---------|
| Formspree | `https://formspree.io/f/xnjaavby` | Contact form submissions → Hans's email |
| Jovanny Jones Site | `https://www.theedgeofhonor.com` | Case study link |
| GitHub Repo | `github.com/solohb5/solo-landing` | Source code |
| Vercel | (check Vercel dashboard) | Production hosting |

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `client/src/pages/LandingPage.tsx` | Main page component, all sections |
| `client/src/components/layout/FixedOverlay.tsx` | Fixed elements (squares, logo, border) |
| `client/src/components/layout/ProjectModal.tsx` | Contact form modal |
| `client/src/components/landing/Hero.tsx` | Hero section |
| `client/src/components/landing/Footer.tsx` | Footer |
| `client/src/index.css` | All custom CSS, animations, color modes |
| `vercel.json` | Vercel deployment config |

---

## Design System

### Colors (Gold Mode - Default)
| Role | Value |
|------|-------|
| Background | #1A1A1A (charcoal) |
| Text | #F5F2EB (warm cream) |
| Text Muted | 60% opacity |
| Accent | #C9A227 (gold) |

### Typography
| Element | Font |
|---------|------|
| Display/Headlines | Cormorant Garamond |
| Body/UI | Inter |

### The Heartbeat
- **Timing:** 1.2s (50 BPM)
- **Effect:** Scale pulse + glow
- **Where:** Top-left square, inline squares, SOLO logo

---

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build:vercel # Build for Vercel
npm run check        # TypeScript check
```

---

## Next Session Suggestions

See `02-BIG-PICTURE.md` for recommended next steps.
