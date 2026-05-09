import { useMemo, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { RecentCheck, WhaleResult } from '@/types';
import { formatRelativeTime, truncateAddress } from '@/lib/utils/format';
import { isLikelySolanaAddress } from '@/lib/utils/wallet';

interface LandingPageProps {
  onAnalyze: (wallet: string) => void;
  recentChecks: RecentCheck[];
}

const DEMO_WALLETS = [
  'CckxW6C1CjsxYcXSiDbk7NYfPLhfqAm3kSB5LEZunnSE',
  '5qg95fzwf26xqu6kLJ6TqfFhEw6iJfQgh7qbJyB5s3TL',
  'ErA56xnxMafrd3ukfA2xM2qLwKxA8T6c8YktMUNfU3tS',
];

function resultBadge(result: WhaleResult) {
  if (result === 'whale') return '🐋 Whale';
  if (result === 'just_hatched') return '🐣 Just Hatched';
  if (result === 'empty') return '🤷 Empty';
  return '🐸 Tadpole';
}

export function LandingPage({ onAnalyze, recentChecks }: LandingPageProps) {
  const [walletInput, setWalletInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const normalized = walletInput.trim();
  const isValidWallet = isLikelySolanaAddress(normalized);
  const hasInput = normalized.length > 0;
  const showError = submitted && hasInput && !isValidWallet;

  const counter = useMemo(() => 1247 + recentChecks.length, [recentChecks.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValidWallet) return;
    onAnalyze(normalized);
  };

  const handleRandomWallet = () => {
    const next = DEMO_WALLETS[Math.floor(Math.random() * DEMO_WALLETS.length)];
    setWalletInput(next);
    onAnalyze(next);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#9945ff] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#14f195] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#03e1ff] opacity-10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-[#9945ff]" />
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#9945ff] via-[#03e1ff] to-[#14f195] bg-clip-text text-transparent">
              Whale or Tadpole
            </h1>
            <TrendingUp className="w-8 h-8 text-[#14f195]" />
          </div>

          <p className="text-xl md:text-2xl text-gray-300">Check any Solana wallet in seconds.</p>
          <p className="text-base text-gray-400 max-w-xl mx-auto">
            Powered by Birdeye data. Paste a wallet, get an instant whale/tadpole score, then share it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="w-full px-6 py-5 bg-[#14042b] border-2 border-[#9945ff]/30 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#9945ff] focus:ring-2 focus:ring-[#9945ff]/50 transition-all text-lg shadow-lg shadow-[#9945ff]/10"
            />
          </div>

          {showError && <p className="text-sm text-red-400 text-left">Invalid Solana wallet address.</p>}

          <button
            type="submit"
            disabled={!isValidWallet}
            className="w-full px-8 py-5 bg-gradient-to-r from-[#9945ff] to-[#14f195] disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#8a3de6] hover:to-[#12d683] text-white rounded-2xl transition-all shadow-lg shadow-[#9945ff]/30 hover:shadow-[#9945ff]/50 hover:scale-[1.02] active:scale-[0.98] text-lg"
          >
            🎯 Check Wallet
          </button>
        </form>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={handleRandomWallet}
            className="px-6 py-3 bg-[#14042b] border border-[#9945ff]/30 hover:border-[#9945ff] text-white rounded-xl transition-all hover:shadow-lg hover:shadow-[#9945ff]/20"
          >
            🎲 Try Random Wallet
          </button>
        </div>

        <div className="text-left max-w-xl mx-auto bg-[#14042b]/40 border border-[#9945ff]/20 rounded-xl p-4">
          <p className="text-sm text-gray-300 mb-2">Recent checks</p>
          {recentChecks.length === 0 ? (
            <p className="text-sm text-gray-500">No checks yet. Be the first 👀</p>
          ) : (
            <ul className="space-y-2">
              {recentChecks.map((item) => (
                <li key={item.address} className="text-sm text-gray-300 flex items-center justify-between gap-2">
                  <span>
                    {truncateAddress(item.address)} → {resultBadge(item.result)}
                  </span>
                  <span className="text-gray-500 text-xs">{formatRelativeTime(item.checkedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm pt-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#14042b]/50 border border-[#9945ff]/20 rounded-full">
            <div className="w-2 h-2 bg-[#14f195] rounded-full animate-pulse" />
            <span>
              <span className="text-[#14f195] font-semibold">{counter.toLocaleString()}</span> wallets ranked this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
