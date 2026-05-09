# Whale or Tadpole

A Solana wallet identity game for the Birdeye BIP Sprint 3 submission.

## What it does

- Input any Solana wallet
- Pulls wallet data from Birdeye API
- Scores it as: **Whale 🐋 / Tadpole 🐸 / Just Hatched 🐣 / Empty 🤷**
- Shows metrics + thresholds hit
- Lets user copy/share result and open Solscan

## Setup

```bash
cd agent/whale-or-tadpole
npm install
cp .env.example .env.local
# set VITE_BIRDEYE_API_KEY
npm run dev
```

## Environment

- `VITE_BIRDEYE_API_KEY` (required)

## Scripts

- `npm run dev`
- `npm run typecheck`
- `npm run build`

## Competition fit

- Data source is Birdeye API endpoints for wallet/token/PNL/activity.
- Built to demo practical use of Birdeye wallet intelligence in a playful consumer product.
