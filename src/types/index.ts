export type WhaleResult = 'whale' | 'tadpole' | 'empty' | 'just_hatched' | 'error';

export interface AnalysisCriterion {
  name: string;
  hit: boolean;
  detail: string;
}

export interface WalletMetrics {
  solBalance: number;
  solValueUsd: number;
  totalPortfolioUsd: number;
  tradeCount: number;
  walletAgeDays: number;
  txCount: number;
  uniqueTokens: number;
  totalVolumeUsd: number;
  realizedPnl: number;
}

export interface Holding {
  symbol: string;
  valueUsd: number;
  percentage: number;
}

export interface WalletAnalysis {
  address: string;
  result: WhaleResult;
  score: number;
  metrics: WalletMetrics;
  criteria: AnalysisCriterion[];
  holdings: Holding[];
  rankLabel: string;
  summary: string;
  walletAgeText: string;
}

export interface RecentCheck {
  address: string;
  result: WhaleResult;
  score: number;
  checkedAt: number;
}

export interface BirdeyeSnapshot {
  solBalance: number;
  solValueUsd: number;
  totalPortfolioUsd: number;
  tradeCount: number;
  walletAgeDays: number;
  txCount: number;
  uniqueTokens: number;
  totalVolumeUsd: number;
  realizedPnl: number;
  holdings: Holding[];
}
