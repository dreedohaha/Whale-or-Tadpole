# Superteam Submission Notes — Whale or Tadpole

## Product summary
Whale or Tadpole is a Solana wallet identity game that classifies any wallet as:
- Whale 🐋
- Tadpole 🐸
- Just Hatched 🐣
- Empty Wallet 🤷

It is built to showcase practical consumer UX on top of Birdeye wallet intelligence APIs.

## Problem
Most users can’t quickly interpret wallet quality/risk from raw on-chain data.

## Solution
We convert Birdeye wallet data into an instant, explainable score + playful identity label with transparent thresholds.

## Core features delivered
- Solana wallet input + validation
- Live Birdeye-powered wallet analysis
- Explainable Whale Score (0–100)
- Threshold-by-threshold pass/fail breakdown
- Portfolio and activity metrics (SOL, USD value, trades, tx count, wallet age, PnL)
- Share/copy result + Solscan deep link
- Recent checks on landing screen

## Birdeye API usage
Primary endpoints used:
- `GET /v1/wallet/token_list`
- `GET /v1/wallet/tx_list`
- `GET /wallet/v2/tx/first-funded`
- `GET /wallet/v2/pnl`
- `GET /wallet/v2/transfer/total`

Headers:
- `X-API-KEY: <key>`
- `x-chain: solana`

## Scoring approach
8 criteria are evaluated from Birdeye data. If >=4 Whale thresholds are hit => Whale, else Tadpole. Special handling for Empty and Just Hatched wallets.

## Tech architecture
- Frontend: React + TypeScript + Vite
- Styling/UI: Tailwind + shadcn-style components from Figma export
- Data layer: Birdeye API client in `src/lib/api/birdeye.ts`
- Scoring engine: `src/lib/scoring/index.ts`

## Why this fits BIP Sprint 3
- Uses Birdeye data as the primary intelligence layer
- Converts data primitives into a usable, engaging end-user product
- Demonstrates composable wallet analytics for social discovery and growth loops
