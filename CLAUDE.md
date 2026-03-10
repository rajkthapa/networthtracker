# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm start        # Start production server
```

No test framework is configured.

## Architecture

**WealthPulse** is a Next.js 14 App Router + TypeScript personal finance tracker using Supabase (auth + Postgres with RLS) and Stripe for subscription billing.

### Route Groups
- `src/app/(marketing)/` — Public landing page at `/`, no auth required
- `src/app/(app)/` — Authenticated pages: `/dashboard`, `/accounts`, `/transactions`, `/networth`, `/crypto`, `/fire`, `/import`
- `src/app/auth/` — Login/signup pages
- `src/app/api/` — API routes for Stripe (checkout, portal, webhook), Plaid (link-token, exchange-token, sync, connections), and price fetching

### Provider Hierarchy (root → leaf)
`AuthProvider` (root layout) → `AppProvider` + `SubscriptionProvider` (app layout)

- **`src/lib/auth-context.tsx`** — AuthProvider wraps root layout; handles signUp/signIn/signOut via Supabase Auth
- **`src/app/(app)/layout.tsx`** — Auth guard (redirects to `/auth/login` if unauthenticated); wraps children in AppProvider → SubscriptionProvider; renders Sidebar + TopBar + MobileNav
- **`src/lib/store.tsx`** — AppProvider context with all CRUD operations (accounts, transactions, crypto, stocks) via Supabase client. Also computes derived values (totalAssets, totalDebts, netWorth, monthly breakdowns)
- **`src/lib/subscription-context.tsx`** — SubscriptionProvider; exposes `isPro`, `plan`, feature-gating logic

### Key Patterns
- All DB operations go through the AppProvider context (no direct Supabase calls from components)
- `src/lib/supabase.ts` — Browser client; `src/lib/supabase-server.ts` — Server client (for API routes)
- Stripe SDK uses lazy proxy init (`src/lib/stripe.ts`) to avoid build-time errors when env vars aren't set
- `src/middleware.ts` — Supabase SSR cookie refresh middleware
- Path alias: `@/*` maps to `./src/*`

### Subscription / Feature Gating
- Freemium + Pro ($9.99/mo) via Stripe
- Free tier limits: 3 accounts max
- Pro-only features: FIRE calculator, Plaid bank connections
- `subscriptions` table auto-created on signup via DB trigger

### External APIs
- CoinGecko (free tier) for crypto prices
- Yahoo Finance for stock prices
- Plaid for bank account connections (pro only)

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side Plaid/Stripe operations)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`

## Database

Schema is in `supabase-schema.sql`. All tables use RLS with `user_id` policies. Tables: profiles, accounts, transactions, crypto_holdings, stock_holdings, price_history, net_worth_snapshots, plaid_items, plaid_accounts, subscriptions.
