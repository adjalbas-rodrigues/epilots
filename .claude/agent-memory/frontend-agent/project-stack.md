---
name: project-stack
description: EPilots frontend stack — Next.js 15, React 19, Tailwind CSS, fonts and color system
metadata:
  type: project
---

## Stack
- **Framework**: Next.js 15 (App Router, `'use client'` pages)
- **React**: 19.1.0
- **CSS**: Tailwind CSS with `@tailwindcss/typography` plugin
- **Icons**: `lucide-react`
- **State**: Redux (ReduxProvider) + React Context (AuthContext, ToastProvider)
- **API**: Custom Axios-based `ApiClient` in `src/lib/api.ts` with interceptors

## Fonts
- Layout loads `Inter` via `next/font/google` and sets on `<body>`
- `globals.css` overrides: body uses `PT Sans`, headings use `Lato` (both from Google Fonts CSS import)
- Tailwind config sets `fontFamily.sans: ['Inter']` — this is NOT the actual body font

## Colors
- CSS custom properties in `:root`: `--brand-primary: #eb1c2d`, `--brand-secondary: #aa1824`
- Background: `#f8f9fa` with subtle radial gradients
- Tailwind `primary` palette is blue (not used by the brand — brand is red)
- Navbar uses red-800/900 gradient backgrounds

## Build
- `npx next build` works clean, `npx tsc --noEmit` has zero errors

**Why:** Understanding the real font/color system avoids using wrong tokens.
**How to apply:** Use `font-['Lato',sans-serif]` for headings, gray-900 bg for primary buttons, brand red for accents only.
