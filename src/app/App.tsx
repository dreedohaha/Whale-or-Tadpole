import { useState } from 'react';
import { Toaster } from 'sonner';
import { LandingPage } from './components/landing-page';
import { ResultPage } from './components/result-page';
import type { RecentCheck, WhaleResult } from '@/types';

export default function App() {
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [recentChecks, setRecentChecks] = useState<RecentCheck[]>([]);

  const handleAnalyze = (wallet: string) => {
    setCurrentWallet(wallet);
  };

  const handleBack = () => {
    setCurrentWallet(null);
  };

  const handleAnalyzed = (wallet: string, result: WhaleResult, score: number) => {
    setRecentChecks((prev) => {
      const next: RecentCheck[] = [
        { address: wallet, result, score, checkedAt: Date.now() },
        ...prev.filter((item) => item.address !== wallet),
      ];
      return next.slice(0, 5);
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0118]">
        {currentWallet ? (
          <ResultPage walletAddress={currentWallet} onBack={handleBack} onAnalyzed={handleAnalyzed} />
        ) : (
          <LandingPage onAnalyze={handleAnalyze} recentChecks={recentChecks} />
        )}
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#14042b',
            border: '1px solid rgba(153, 69, 255, 0.3)',
            color: '#ffffff',
          },
        }}
      />
    </>
  );
}
