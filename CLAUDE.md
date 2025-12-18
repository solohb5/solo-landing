# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solo Canvas is a premium landing page for Solo Designs, a high-end design studio. It's a single-page React application featuring a stunning morphing blob as the visual centerpiece. Visitors arrive from "BY SOLO DESIGNS" links in client site footers (e.g., theedgeofhonor.com).

## Commands

```bash
npm run dev          # Start dev server (port 3000) - serves both API and client
npm run build        # Production build (Vite client + esbuild server)
npm run build:vercel # Vercel-specific build (client only)
npm run check        # TypeScript type checking
```

## Architecture

### Monorepo Structure
- `client/` - React frontend (Vite)
- `server/` - Express backend
- `shared/` - Shared types and schema (Drizzle + Zod)
- `client/src/assets/silhouettes/` - SVG silhouettes for blob morphing

### Key Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Frontend Stack
- React 19 + TypeScript
- Vite 7 with HMR
- Tailwind CSS 4
- Framer Motion for animations
- shadcn/ui components (Radix primitives)
- wouter for routing
- TanStack Query for data fetching
- react-hook-form + zod for forms

### Backend Stack
- Express with TypeScript
- In-memory storage (MemStorage class in `server/storage.ts`)
- Drizzle ORM configured for PostgreSQL (schema in `shared/schema.ts`)

## The Morphing Blob (Key Feature)

Located in `client/src/pages/home.tsx` as the `MorphingBlob` component.

### How It Works
1. **SimplexNoise** creates organic, continuous movement
2. **SVG Path Parsing** extracts points from silhouette SVGs
3. **Polar Coordinates** convert Cartesian points for radial manipulation
4. **Gaussian Smoothing + Catmull-Rom Splines** for smooth shapes
5. **Canvas/WebGL** renders multiple translucent layers

### Current Silhouettes (3 energies)
| Silhouette | File | Color Palette |
|------------|------|---------------|
| Man Portrait (side profile) | `man-sil.svg` | Electric Blue |
| Front-Facing (direct) | `front-sil.svg` | Teal/Cyan |
| Celebrate (hands up) | `celebrate-sil.svg` | Green/Gold |

### Key Parameters
- `maxMorph = 0.88` — How much blob becomes human (0 = blob, 1 = exact silhouette)
- `colorTime = t * 0.022` — Color transition speed (~45 sec full cycle)
- `TOTAL_CYCLE = 10` — Seconds per morph cycle

### To Add a New Silhouette
1. Add SVG to `client/src/assets/silhouettes/`
2. Extract path data from SVG
3. Add to `silhouettePaths` array in MorphingBlob
4. Add corresponding color palette to `colorPalettes`

## Current State

**Landing page is complete and working locally.** Features:
- Morphing blob with 3 silhouettes cycling with color transitions
- Hero: "Story-driven design" + "Let's build your digital legacy"
- Quote reveal on scroll: "We don't make websites. We create digital legacies."
- Custom cursor with magnetic buttons
- Contact form (Formspree)
- Dark aesthetic with cream accents

## Next Steps
- [ ] Git commit and push
- [ ] Deploy to Vercel

## Style Notes

- **Aesthetic:** Premium, artistic, NOT template-y
- **Colors:** Dark background, electric blue/teal/green accents, cream text
- **Typography:** Large, sculptural, theatrical reveals
- **Feel:** The page should make designers want to screenshot it
