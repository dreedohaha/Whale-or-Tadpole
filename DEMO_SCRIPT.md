# Whale or Tadpole — 90s Demo Script

## Goal
Show that the app uses Birdeye data to classify Solana wallets into Whale/Tadpole transparently.

## Script (talk track)
1. **Open app landing**
   - "This is Whale or Tadpole — a fast wallet identity game powered by Birdeye."
2. **Enter wallet #1 (strong wallet)**
   - "I’ll check this wallet. We fetch live portfolio, tx activity, and PnL via Birdeye API."
3. **Show result page**
   - Point to: Whale Score, Portfolio Value, Trade Count, Wallet Age, Thresholds hit.
   - "Classification is rule-based and explainable — you can see exactly why this is Whale."
4. **Enter wallet #2 (small/new wallet)**
   - "Now compare with a smaller/newer wallet."
   - Show Tadpole / Just Hatched result.
5. **Show share + Solscan**
   - "Users can copy/share result and verify wallet on Solscan in one click."
6. **Close**
   - "This is a playful but data-rich consumer layer for Birdeye wallet intelligence."

## Suggested wallets for demo
- Whale: `CckxW6C1CjsxYcXSiDbk7NYfPLhfqAm3kSB5LEZunnSE`
- Tadpole/new: use a low-activity wallet from your test set

## Backup line (if API hiccups)
"The app retries on API failures and handles rate limits; classification logic stays deterministic once data is returned."
