const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function isLikelySolanaAddress(address: string) {
  const trimmed = address.trim();
  if (trimmed.length < 32 || trimmed.length > 44) return false;
  return BASE58_REGEX.test(trimmed);
}
