import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, RefreshCw, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getWalletSnapshot } from '@/lib/api/birdeye';
import { scoreWallet } from '@/lib/scoring';
import { formatNumber, formatSol, formatUsd, truncateAddress } from '@/lib/utils/format';
import type { WalletAnalysis, WhaleResult } from '@/types';

interface ResultPageProps {
  walletAddress: string;
  onBack: () => void;
  onAnalyzed: (wallet: string, result: WhaleResult, score: number) => void;
}

function resultConfig(result: WhaleResult) {
  switch (result) {
    case 'whale':
      return { emoji: '🐋', label: 'WHALE', color: '#9945ff', note: 'Big player energy.' };
    case 'tadpole':
      return { emoji: '🐸', label: 'TADPOLE', color: '#14f195', note: 'Still early. Keep swimming.' };
    case 'just_hatched':
      return { emoji: '🐣', label: 'JUST HATCHED', color: '#03e1ff', note: 'New wallet detected.' };
    case 'empty':
      return { emoji: '🤷', label: 'EMPTY WALLET', color: '#f59e0b', note: 'No activity yet.' };
    default:
      return { emoji: '⚠️', label: 'ERROR', color: '#ef4444', note: 'Could not analyze.' };
  }
}

export function ResultPage({ walletAddress, onBack, onAnalyzed }: ResultPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const snapshot = await getWalletSnapshot(walletAddress);
      const scored = scoreWallet(walletAddress, snapshot);
      setAnalysis(scored);
      onAnalyzed(walletAddress, scored.result, scored.score);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to analyze wallet';
      setError(message);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const config = useMemo(() => resultConfig(analysis?.result ?? 'error'), [analysis?.result]);

  const handleShare = async () => {
    if (!analysis) return;

    const shareText = `${config.emoji} ${config.label}\n\n${truncateAddress(walletAddress)}\nPortfolio: ${formatUsd(analysis.metrics.totalPortfolioUsd)}\nScore: ${analysis.score}/100\n\nWhale or Tadpole?`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Share text copied!');
    } catch {
      toast.error('Could not copy share text.');
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet copied.');
    } catch {
      toast.error('Could not copy wallet.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-[#9945ff]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#9945ff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xl text-gray-300">Analyzing wallet...</p>
          <p className="text-sm text-gray-500">Pulling Birdeye on-chain data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-2xl mx-auto bg-[#14042b] border border-red-500/40 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-2">⚠️ Analysis failed</p>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={runAnalysis}
              className="px-5 py-3 rounded-xl bg-[#9945ff] hover:bg-[#8a3de6] text-white flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <button onClick={onBack} className="px-5 py-3 rounded-xl border border-white/20 text-white">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="min-h-screen px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 opacity-20 blur-[120px] rounded-full" style={{ backgroundColor: config.color }} />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#03e1ff] opacity-10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Analyze Another
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#14042b] to-[#1a0a2e] border-2 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8"
          style={{ borderColor: `${config.color}40` }}
        >
          <div className="text-center space-y-3">
            <div className="text-8xl">{config.emoji}</div>
            <h2 className="text-4xl md:text-6xl font-black" style={{ color: config.color }}>
              {config.label}
            </h2>
            <p className="text-gray-300">{config.note}</p>
          </div>

          <div className="text-center py-6 px-4 bg-black/30 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-sm">Whale Score</p>
            <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#9945ff] to-[#14f195] bg-clip-text text-transparent mb-2">
              {analysis.score}/100
            </div>
            <p className="text-gray-400">{analysis.rankLabel}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="SOL Balance" value={formatSol(analysis.metrics.solBalance)} color={config.color} />
            <StatCard label="Portfolio Value" value={formatUsd(analysis.metrics.totalPortfolioUsd)} color={config.color} />
            <StatCard label="Trade Count" value={formatNumber(analysis.metrics.tradeCount)} color="#14f195" />
            <StatCard label="Wallet Age" value={analysis.walletAgeText} color="#03e1ff" />
            <StatCard label="Transaction Count" value={formatNumber(analysis.metrics.txCount)} color="#a78bfa" />
            <StatCard label="Realized PnL" value={formatUsd(analysis.metrics.realizedPnl)} color={analysis.metrics.realizedPnl >= 0 ? '#14f195' : '#ef4444'} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider">Thresholds hit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.criteria.map((criterion) => (
                <div key={criterion.name} className="text-sm p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-200">{criterion.name}</span>
                    <span>{criterion.hit ? '✅' : '❌'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{criterion.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider">Top Holdings</h3>
            <div className="space-y-2">
              {analysis.holdings.length === 0 ? (
                <p className="text-sm text-gray-500">No token holdings found.</p>
              ) : (
                analysis.holdings.map((holding) => (
                  <div key={holding.symbol} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center justify-between text-sm">
                      <span className="text-white">{holding.symbol}</span>
                      <span className="text-gray-400">{holding.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-[#9945ff] to-[#03e1ff]" style={{ width: `${Math.min(holding.percentage, 100)}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#9945ff] to-[#14f195] hover:from-[#8a3de6] hover:to-[#12d683] text-white rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Share2 className="w-5 h-5" /> Share Result
            </button>
            <button
              onClick={handleCopyAddress}
              className="px-6 py-4 bg-[#14042b] border border-[#9945ff]/30 hover:border-[#9945ff] text-white rounded-xl transition-all"
            >
              <Copy className="w-5 h-5" />
            </button>
            <a
              href={`https://solscan.io/account/${walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-4 bg-[#14042b] border border-[#03e1ff]/30 hover:border-[#03e1ff] text-white rounded-xl transition-all inline-flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" /> Solscan
            </a>
          </div>

          <div className="text-center pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 font-mono break-all">{walletAddress}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-6 bg-black/30 rounded-xl border border-white/5">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className="text-2xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
