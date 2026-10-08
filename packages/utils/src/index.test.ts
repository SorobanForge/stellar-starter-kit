import { describe, it, expect } from 'vitest';
import {
  formatAddress,
  formatStroopsToXlm,
  parseXlmToStroops,
  formatDuration,
  computeVestedAmount,
  computeProgressBps,
  formatBps,
} from './index';

describe('formatAddress', () => {
  it('shortens long public keys', () => {
    expect(formatAddress('GD3W5PQLX6Y6S7WLMCP6UFRT4N4IELKJD3X54V5A7LNLNEQ5Z6L4HJK3')).toBe(
      'GD3W...HJK3',
    );
  });

  it('returns short values unchanged', () => {
    expect(formatAddress('GD3W')).toBe('GD3W');
  });
});

describe('formatStroopsToXlm', () => {
  it('formats whole amounts', () => {
    expect(formatStroopsToXlm(10_000_000)).toBe('1');
    expect(formatStroopsToXlm('50000000')).toBe('5');
  });

  it('formats fractional amounts without trailing zeros', () => {
    expect(formatStroopsToXlm(BigInt(123_456_789))).toBe('12.3456789');
    expect(formatStroopsToXlm(1)).toBe('0.0000001');
  });

  it('preserves precision beyond Number.MAX_SAFE_INTEGER', () => {
    // 9007199254740993 stroops == 900719925.4740993 XLM
    expect(formatStroopsToXlm(9_007_199_254_740_993n)).toBe('900719925.4740993');
  });

  it('handles negatives', () => {
    expect(formatStroopsToXlm(-10_000_000)).toBe('-1');
  });
});

describe('parseXlmToStroops', () => {
  it('parses whole and fractional XLM', () => {
    expect(parseXlmToStroops('1')).toBe(10_000_000n);
    expect(parseXlmToStroops('0.0000001')).toBe(1n);
    expect(parseXlmToStroops(12.3456789)).toBe(123_456_789n);
  });

  it('truncates precision beyond 7 decimals', () => {
    expect(parseXlmToStroops('1.00000019')).toBe(10_000_001n);
  });

  it('round-trips with formatStroopsToXlm', () => {
    const stroops = 123_456_789n;
    expect(parseXlmToStroops(formatStroopsToXlm(stroops))).toBe(stroops);
  });

  it('rejects invalid input', () => {
    expect(() => parseXlmToStroops('abc')).toThrow();
    expect(() => parseXlmToStroops('')).toThrow();
    expect(() => parseXlmToStroops('.')).toThrow();
  });
});

describe('formatDuration', () => {
  it('formats seconds, minutes, hours and days', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(90)).toBe('1m');
    expect(formatDuration(3_661)).toBe('1h 1m');
    expect(formatDuration(90_061)).toBe('1d 1h 1m');
    expect(formatDuration(-5)).toBe('0s');
  });
});

describe('vesting math', () => {
  const schedule = {
    totalAmount: 1_000n,
    startTime: 0,
    endTime: 1_000,
    cliffTime: 0,
  };

  it('returns 0 before the cliff', () => {
    expect(computeVestedAmount({ ...schedule, cliffTime: 400 }, 399)).toBe(0n);
  });

  it('vests linearly', () => {
    expect(computeVestedAmount(schedule, 0)).toBe(0n);
    expect(computeVestedAmount(schedule, 250)).toBe(250n);
    expect(computeVestedAmount(schedule, 500)).toBe(500n);
    expect(computeVestedAmount(schedule, 1_000)).toBe(1_000n);
    expect(computeVestedAmount(schedule, 5_000)).toBe(1_000n);
  });

  it('computes progress in basis points', () => {
    expect(computeProgressBps(schedule, 0)).toBe(0);
    expect(computeProgressBps(schedule, 500)).toBe(5_000);
    expect(computeProgressBps(schedule, 1_000)).toBe(10_000);
    expect(formatBps(5_000)).toBe('50%');
    expect(formatBps(2_550)).toBe('25.5%');
  });
});
