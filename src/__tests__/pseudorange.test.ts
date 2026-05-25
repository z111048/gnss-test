import { describe, it, expect } from 'vitest';
import {
  timeDiffToPseudorange,
  ecefDistanceKm,
  ecefDistanceM,
  generatePseudorange,
} from '../features/gps-calculation/pseudorange';
import { C } from '../utils/units';

describe('timeDiffToPseudorange', () => {
  it('returns 0 for zero time difference', () => {
    expect(timeDiffToPseudorange(0)).toBe(0);
  });

  it('multiplies by speed of light correctly', () => {
    const result = timeDiffToPseudorange(0.067);
    expect(result).toBeCloseTo(C * 0.067, 0);
  });

  it('1 nanosecond corresponds to ~0.3m', () => {
    const result = timeDiffToPseudorange(1e-9);
    expect(result).toBeCloseTo(0.3, 1);
  });

  it('typical GPS signal travel time ~67ms gives ~20,000 km', () => {
    const result = timeDiffToPseudorange(0.067);
    expect(result / 1000).toBeCloseTo(20086, -2); // within 100 km
  });
});

describe('ecefDistanceKm', () => {
  it('returns 0 for same point', () => {
    const p: [number, number, number] = [100, 200, 300];
    expect(ecefDistanceKm(p, p)).toBe(0);
  });

  it('correctly computes distance along X axis', () => {
    const a: [number, number, number] = [0, 0, 0];
    const b: [number, number, number] = [100, 0, 0];
    expect(ecefDistanceKm(a, b)).toBe(100);
  });

  it('correctly computes 3D Euclidean distance', () => {
    const a: [number, number, number] = [0, 0, 0];
    const b: [number, number, number] = [3, 4, 0];
    expect(ecefDistanceKm(a, b)).toBe(5);
  });

  it('is symmetric', () => {
    const a: [number, number, number] = [1000, 2000, 3000];
    const b: [number, number, number] = [4000, 5000, 6000];
    expect(ecefDistanceKm(a, b)).toBeCloseTo(ecefDistanceKm(b, a), 10);
  });
});

describe('ecefDistanceM', () => {
  it('returns distance in meters (1000× km)', () => {
    const a: [number, number, number] = [0, 0, 0];
    const b: [number, number, number] = [1, 0, 0]; // 1 km
    expect(ecefDistanceM(a, b)).toBe(1000);
  });
});

describe('generatePseudorange', () => {
  const satPos: [number, number, number] = [26560, 0, 0]; // km
  const recvPos: [number, number, number] = [6371, 0, 0]; // km (on Earth surface)
  const trueRangeM = (26560 - 6371) * 1000;

  it('without clock bias or noise, returns true geometric range', () => {
    const pr = generatePseudorange(satPos, recvPos, 0, 0);
    expect(pr).toBeCloseTo(trueRangeM, 0);
  });

  it('positive clock bias increases pseudorange', () => {
    const clockBiasS = 1e-6; // 1 microsecond
    const pr = generatePseudorange(satPos, recvPos, clockBiasS, 0);
    expect(pr).toBeGreaterThan(trueRangeM);
    expect(pr - trueRangeM).toBeCloseTo(clockBiasS * C, 0);
  });

  it('negative clock bias decreases pseudorange', () => {
    const clockBiasS = -1e-6;
    const pr = generatePseudorange(satPos, recvPos, clockBiasS, 0);
    expect(pr).toBeLessThan(trueRangeM);
  });

  it('with noise, result differs from noiseless', () => {
    const results = Array.from({ length: 20 }, () =>
      generatePseudorange(satPos, recvPos, 0, 10)
    );
    const unique = new Set(results);
    expect(unique.size).toBeGreaterThan(1);
  });
});
