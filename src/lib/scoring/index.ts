import type { AnalysisCriterion, BirdeyeSnapshot, WalletAnalysis, WhaleResult } from '@/types';
import { getWalletAgeText } from '@/lib/utils/format';

function toCriterion(name: string, hit: boolean, detail: string): AnalysisCriterion {
  return { name, hit, detail };
}

export function scoreWallet(address: string, data: BirdeyeSnapshot): WalletAnalysis {
  const criteria = [
    toCriterion('SOL Balance (USD)', data.solValueUsd >= 1000, `${data.solValueUsd.toFixed(0)} USD`),
    toCriterion('Portfolio Value', data.totalPortfolioUsd >= 5000, `${data.totalPortfolioUsd.toFixed(0)} USD`),
    toCriterion('Trade Count', data.tradeCount >= 100, `${data.tradeCount} trades`),
    toCriterion('Wallet Age', data.walletAgeDays >= 90, `${data.walletAgeDays} days`),
    toCriterion('Transaction Count', data.txCount >= 500, `${data.txCount} tx`),
    toCriterion('Unique Tokens', data.uniqueTokens >= 10, `${data.uniqueTokens} tokens`),
    toCriterion('Total Volume', data.totalVolumeUsd >= 10000, `${data.totalVolumeUsd.toFixed(0)} USD`),
    toCriterion('Profitability', data.realizedPnl > 0, `${data.realizedPnl.toFixed(0)} USD`),
  ];

  const hits = criteria.filter((c) => c.hit).length;
  const score = Math.round((hits / criteria.length) * 100);

  const hasNoActivity = data.totalPortfolioUsd <= 1 && data.txCount === 0 && data.tradeCount === 0;
  const justHatched = data.walletAgeDays <= 1 && data.txCount <= 1;

  let result: WhaleResult;
  let summary: string;
  let rankLabel: string;

  if (hasNoActivity) {
    result = 'empty';
    summary = 'Empty Wallet 🤷';
    rankLabel = 'No on-chain activity yet';
  } else if (justHatched) {
    result = 'just_hatched';
    summary = 'Just Hatched 🐣';
    rankLabel = 'Brand new wallet';
  } else if (hits >= 4) {
    result = 'whale';
    summary = 'Whale detected 🐋';
    rankLabel = hits >= 6 ? 'Mega Whale' : 'Whale';
  } else {
    result = 'tadpole';
    summary = 'Tadpole vibes 🐸';
    rankLabel = 'Tadpole';
  }

  return {
    address,
    result,
    score,
    metrics: {
      solBalance: data.solBalance,
      solValueUsd: data.solValueUsd,
      totalPortfolioUsd: data.totalPortfolioUsd,
      tradeCount: data.tradeCount,
      walletAgeDays: data.walletAgeDays,
      txCount: data.txCount,
      uniqueTokens: data.uniqueTokens,
      totalVolumeUsd: data.totalVolumeUsd,
      realizedPnl: data.realizedPnl,
    },
    criteria,
    holdings: data.holdings,
    rankLabel,
    summary,
    walletAgeText: getWalletAgeText(data.walletAgeDays),
  };
}
