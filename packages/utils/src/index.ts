/**
 * Formatting and vesting-math helpers shared across the Stellar Streams stack.
 * All monetary math is done with `bigint` to avoid IEEE-754 precision loss.
 */

/** Number of stroops in one XLM (1 XLM = 10^7 stroops). */
export const STROOPS_PER_XLM = 10_000_000n;

/** Shortens a public key/address for display purposes (e.g. GABC...XYZ1). */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Formats a raw stroop amount into a human-readable XLM string, preserving
 * precision for values larger than `Number.MAX_SAFE_INTEGER`.
 */
export function formatStroopsToXlm(stroops: bigint | number | string): string {
  const value = BigInt(stroops);
  const negative = value < 0n;
  const abs = negative ? -value : value;

  const whole = abs / STROOPS_PER_XLM;
  const fraction = abs % STROOPS_PER_XLM;
  const sign = negative ? '-' : '';

  if (fraction === 0n) return `${sign}${whole.toString()}`;

  const fractionStr = fraction.toString().padStart(7, '0').replace(/0+$/, '');
  return `${sign}${whole.toString()}.${fractionStr}`;
}

/**
 * Parses a human-readable XLM amount into stroops. Fractional digits beyond
 * 7 decimal places are truncated (they are below the smallest unit).
 */
export function parseXlmToStroops(xlm: string | number): bigint {
  const raw = typeof xlm === 'number' ? xlm.toString() : xlm.trim();
  if (!/^-?\d*(\.\d*)?$/.test(raw) || raw === '' || raw === '.' || raw === '-') {
    throw new Error(`Invalid XLM amount: ${String(xlm)}`);
  }

  const negative = raw.startsWith('-');
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole = '0', fraction = ''] = unsigned.split('.');
  const paddedFraction = (fraction + '0000000').slice(0, 7);

  const result = BigInt(whole || '0') * STROOPS_PER_XLM + BigInt(paddedFraction || '0');
  return negative ? -result : result;
}

/** Formats a duration in seconds into a compact human string (e.g. "2d 3h 4m"). */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${total}s`);
  return parts.join(' ');
}

/** A linear vesting schedule, mirroring the on-chain `Stream` time fields. */
export interface VestingSchedule {
  totalAmount: bigint;
  startTime: number;
  endTime: number;
  cliffTime: number;
}

/**
 * Computes the amount vested at `now`, using the same integer math as the
 * `stream` Soroban contract. Keep this in sync with `vested_amount` in Rust.
 */
export function computeVestedAmount(schedule: VestingSchedule, now: number): bigint {
  const { totalAmount, startTime, endTime, cliffTime } = schedule;
  if (now < startTime || now < cliffTime) return 0n;
  if (now >= endTime) return totalAmount;

  const elapsed = BigInt(now - startTime);
  const duration = BigInt(endTime - startTime);
  return (totalAmount * elapsed) / duration;
}

/** How much of the stream has vested, expressed in basis points (0–10000). */
export function computeProgressBps(schedule: VestingSchedule, now: number): number {
  const { totalAmount, endTime, startTime } = schedule;
  if (totalAmount <= 0n) return 0;
  if (now <= startTime) return 0;
  if (now >= endTime) return 10_000;

  const elapsed = BigInt(now - startTime);
  const duration = BigInt(endTime - startTime);
  return Number(((elapsed * 10_000n) / duration).valueOf());
}

/** Formats basis points as a percentage string (e.g. 2550 -> "25.5%"). */
export function formatBps(bps: number): string {
  const clamped = Math.max(0, Math.min(10_000, bps));
  return `${(clamped / 100).toFixed(clamped % 100 === 0 ? 0 : 1)}%`;
}
