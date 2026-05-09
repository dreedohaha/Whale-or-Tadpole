import type { BirdeyeSnapshot, Holding } from '@/types';

const BASE_URL = 'https://public-api.birdeye.so';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

function headers() {
  const apiKey = import.meta.env.VITE_BIRDEYE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Birdeye API key. Add VITE_BIRDEYE_API_KEY in .env.local');
  }

  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'x-chain': 'solana',
  };
}

async function fetchBirdeye(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if (!res.ok || json?.success === false) {
    const message = json?.message || `Birdeye request failed: ${res.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  return json;
}

async function rpc(method: string, params: any[]) {
  const res = await fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });

  const json = await res.json();
  if (json?.error) throw new Error(json.error.message || 'RPC error');
  return json?.result;
}

async function getSolPriceUsd() {
  try {
    const price = await fetchBirdeye(`/defi/price?address=${SOL_MINT}`);
    return Number(price?.data?.value || 0);
  } catch {
    return 0;
  }
}

function normalizeTokenItems(items: any[], totalUsd: number): Holding[] {
  return (items || [])
    .map((item) => {
      const valueUsd = Number(item?.valueUsd || 0);
      const symbol = String(item?.symbol || item?.name || 'UNKNOWN');
      const percentage = totalUsd > 0 ? (valueUsd / totalUsd) * 100 : 0;
      return { symbol, valueUsd, percentage };
    })
    .filter((it) => it.valueUsd > 0)
    .sort((a, b) => b.valueUsd - a.valueUsd)
    .slice(0, 5);
}

function toDayAge(blockTime?: number): number {
  if (!blockTime || !Number.isFinite(blockTime)) return 0;
  const tsMs = blockTime > 1e12 ? blockTime : blockTime * 1000;
  return Math.max(0, Math.floor((Date.now() - tsMs) / 86_400_000));
}

function getTxCount(txListData: any, transferTotalData: any): number {
  const totalCandidates = [
    transferTotalData?.data?.total,
    transferTotalData?.data?.count,
    transferTotalData?.data,
    txListData?.data?.total,
    txListData?.data?.count,
  ];

  for (const c of totalCandidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c;
  }

  const listCandidates = [txListData?.data?.items, txListData?.data?.transactions, txListData?.data];

  for (const list of listCandidates) {
    if (Array.isArray(list)) return list.length;
  }

  return 0;
}

async function getWalletSnapshotFromRpcFallback(wallet: string): Promise<BirdeyeSnapshot> {
  const [balanceRes, signatures, tokenAccounts, solPriceUsd] = await Promise.all([
    rpc('getBalance', [wallet]),
    rpc('getSignaturesForAddress', [wallet, { limit: 1000 }]),
    rpc('getTokenAccountsByOwner', [wallet, { programId: TOKEN_PROGRAM }, { encoding: 'jsonParsed' }]),
    getSolPriceUsd(),
  ]);

  const solBalance = Number(balanceRes?.value || 0) / 1_000_000_000;
  const solValueUsd = solBalance * solPriceUsd;

  const sigs = Array.isArray(signatures) ? signatures : [];
  const txCount = sigs.length;
  const oldest = sigs[sigs.length - 1]?.blockTime;
  const walletAgeDays = toDayAge(oldest);

  const tokenList = Array.isArray(tokenAccounts?.value) ? tokenAccounts.value : [];
  const nonZeroTokens = tokenList.filter((acc: any) => {
    const amount = Number(acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0);
    return amount > 0;
  });

  const uniqueTokens = nonZeroTokens.length;

  return {
    solBalance,
    solValueUsd,
    totalPortfolioUsd: solValueUsd,
    tradeCount: Math.floor(txCount * 0.2),
    walletAgeDays,
    txCount,
    uniqueTokens,
    totalVolumeUsd: 0,
    realizedPnl: 0,
    holdings: solValueUsd > 0 ? [{ symbol: 'SOL', valueUsd: solValueUsd, percentage: 100 }] : [],
  };
}

export async function getWalletSnapshot(wallet: string): Promise<BirdeyeSnapshot> {
  try {
    const [tokenList, txList, firstFunded, pnl, transferTotal] = await Promise.all([
      fetchBirdeye(`/v1/wallet/token_list?wallet=${wallet}`),
      fetchBirdeye(`/v1/wallet/tx_list?wallet=${wallet}&limit=100`),
      fetchBirdeye(`/v1/wallet/v2/tx/first-funded?wallet=${wallet}`),
      fetchBirdeye(`/v1/wallet/v2/pnl?wallet=${wallet}`),
      fetchBirdeye(`/v1/wallet/v2/transfer/total?wallet=${wallet}`),
    ]);

    const totalPortfolioUsd = Number(tokenList?.data?.totalUsd || 0);
    const tokenItems = tokenList?.data?.items || [];

    const solToken = tokenItems.find((item: any) => String(item?.symbol || '').toUpperCase() === 'SOL');
    const solBalance = Number(solToken?.uiAmount || solToken?.balance || 0);
    const solValueUsd = Number(solToken?.valueUsd || 0);

    const walletAgeDays = toDayAge(firstFunded?.data?.blockTime);

    const tradeCount = Number(pnl?.data?.tradeCount || 0);
    const totalBuyVolume = Number(pnl?.data?.totalBuyVolume || 0);
    const totalSellVolume = Number(pnl?.data?.totalSellVolume || 0);
    const totalVolumeUsd = totalBuyVolume + totalSellVolume;
    const realizedPnl = Number(pnl?.data?.realizedPnL || 0);

    const txCount = getTxCount(txList, transferTotal);
    const uniqueTokens = Array.isArray(tokenItems) ? tokenItems.length : 0;

    return {
      solBalance,
      solValueUsd,
      totalPortfolioUsd,
      tradeCount,
      walletAgeDays,
      txCount,
      uniqueTokens,
      totalVolumeUsd,
      realizedPnl,
      holdings: normalizeTokenItems(tokenItems, totalPortfolioUsd),
    };
  } catch (error: any) {
    if (error?.status === 401) {
      return getWalletSnapshotFromRpcFallback(wallet);
    }
    throw error;
  }
}
