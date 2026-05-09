export function truncateAddress(address: string, left = 4, right = 4) {
  if (!address) return '';
  if (address.length <= left + right) return address;
  return `${address.slice(0, left)}...${address.slice(-right)}`;
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Number.isFinite(value) ? value : 0);
}

export function formatSol(value: number) {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0)} SOL`;
}

export function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getWalletAgeText(days: number) {
  if (days < 1) return 'Just hatched 🐣';
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months`;
  const years = (days / 365).toFixed(1);
  return `${years} years`;
}
