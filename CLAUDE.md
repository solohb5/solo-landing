# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solo Canvas is a premium landing page for Solo Designs, a design studio. It's a single-page React application with an Express backend, featuring a booking form that submits to Formspree.

## Commands

```bash
npm run dev          # Start dev server (port 5000) - serves both API and client
npm run build        # Production build (Vite client + esbuild server)
npm run build:vercel # Vercel-specific build (client only)
npm run check        # TypeScript type checking
npm run db:push      # Push Drizzle schema to database
```

## Architecture

### Monorepo Structure
- `client/` - React frontend (Vite)
- `server/` - Express backend
- `shared/` - Shared types and schema (Drizzle + Zod)

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
- Session support via express-session

### Server Architecture
The Express server (`server/index.ts`) serves both the API and client:
- Development: Vite middleware handles client with HMR
- Production: Static files served from `dist/public`
- API routes prefixed with `/api` (registered in `server/routes.ts`)

### Build Process
`script/build.ts` handles production builds:
1. Vite builds client to `dist/public`
2. esbuild bundles server to `dist/index.cjs` (CJS format)
3. Some deps are bundled, others externalized for cold start optimization

## Current State

This is a single-page landing page with:
- Hero section with parallax scroll effects
- Custom cursor animation
- Booking dialog with form (submits to Formspree)
- Dark aesthetic with cream accent color

The backend storage interface exists but isn't actively used - the contact form POSTs directly to Formspree.
