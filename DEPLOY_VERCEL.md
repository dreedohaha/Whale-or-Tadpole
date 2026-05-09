# Deploy to Vercel (Vite)

## 1) Push repo
Push `agent/whale-or-tadpole` to GitHub.

## 2) Import in Vercel
- New Project -> Import repo
- Framework preset: **Vite** (auto-detected)
- Build command: `npm run build`
- Output directory: `dist`

## 3) Environment variables
Set in Vercel Project Settings -> Environment Variables:
- `VITE_BIRDEYE_API_KEY` = your Birdeye key

## 4) Deploy
Click Deploy.

## 5) Verify after deploy
- Landing loads
- Wallet input validation works
- Result page returns live data
- Share + Solscan links work

## Optional custom domain
- Add domain (e.g. `whaletadpole.xyz`) in Vercel -> Domains
- Update DNS records per Vercel instructions
