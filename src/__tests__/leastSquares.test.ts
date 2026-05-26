import { describe, it, expect } from 'vitest';
import { solveLeastSquares, buildHMatrix } from '../features/gps-calculation/leastSquares';
import { generatePseudorange } from '../features/gps-calculation/pseudorange';

/** True receiver position (km) */
const TRUE_POS: [number, number, number] = [-3954, 3354, 3700];

/** 4 demo satellites at GPS orbit distance */
const SATELLITES: [number, number, number][] = [
  [26560, 0, 0],
  [0, 26560, 0],
  [-13280, 0, 22990],
  [-13280, 22990, -13280],
];

function makeSats(clockBiasS = 0, noiseSigma = 0) {
  return SATELLITES.map((pos) => ({
    position: pos,
    pseudorange: generatePseudorange(pos, TRUE_POS, clockBiasS, noiseSigma),
  }));
}

describe('solveLeastSquares', () => {
  it('returns an array of iteration steps', () => {
    const sats = makeSats();
    const steps = solveLeastSquares(sats);
    expect(steps.length).toBeGreaterThanOrEqual(1);
  });

  it('converges to true position within 1 km (no noise, no bias)', () => {
    const sats = makeSats(0, 0);
    const steps = solveLeastSquares(sats, [0, 0, 0]);
    const last = steps[steps.length - 1];
    expect(Math.abs(last.x - TRUE_POS[0])).toBeLessThan(1);
    expect(Math.abs(last.y - TRUE_POS[1])).toBeLessThan(1);
    expect(Math.abs(last.z - TRUE_POS[2])).toBeLessThan(1);
  });

  it('residual norm decreases over iterations', () => {
    const sats = makeSats(0, 0);
    const steps = solveLeastSquares(sats, [0, 0, 0]);
    if (steps.length >= 2) {
      expect(steps[steps.length - 1].residualNorm).toBeLessThan(steps[0].residualNorm);
    }
  });

  it('handles non-zero clock bias', () => {
    const clockBiasS = 1e-6; // 1 µs ≈ 300m
    const sats = makeSats(clockBiasS, 0);
    const steps = solveLeastSquares(sats, [0, 0, 0]);
    const last = steps[steps.length - 1];
    // Position should still converge within 1 km
    expect(Math.abs(last.x - TRUE_POS[0])).toBeLessThan(1);
    expect(Math.abs(last.y - TRUE_POS[1])).toBeLessThan(1);
    expect(Math.abs(last.z - TRUE_POS[2])).toBeLessThan(1);
  });

  it('does not exceed maxIterations', () => {
    const sats = makeSats(0, 0);
    const steps = solveLeastSquares(sats, [0, 0, 0], 5);
    expect(steps.length).toBeLessThanOrEqual(6); // maxIterations + possible final step
  });

  it('each step has the required fields', () => {
    const sats = makeSats();
    const steps = solveLeastSquares(sats);
    for (const step of steps) {
      expect(typeof step.iteration).toBe('number');
      expect(typeof step.x).toBe('number');
      expect(typeof step.y).toBe('number');
      expect(typeof step.z).toBe('number');
      expect(typeof step.B).toBe('number');
      expect(typeof step.residualNorm).toBe('number');
    }
  });

  it('records detailed solve data for each iteration', () => {
    const sats = makeSats(0, 0);
    const steps = solveLeastSquares(sats, [0, 0, 0]);
    const first = steps[0];

    expect(first.delta?.length).toBe(4);
    expect(first.updatedState?.length).toBe(4);
    expect(first.observations?.length).toBe(SATELLITES.length);
    expect(first.hMatrix?.length).toBe(SATELLITES.length);
    expect(first.normalMatrix?.length).toBe(4);
    expect(first.normalVector?.length).toBe(4);
    expect(first.observations?.[0].observedPseudorange).toBeGreaterThan(0);
    expect(typeof first.observations?.[0].residual).toBe('number');
  });
});

describe('buildHMatrix', () => {
  it('returns one row per satellite', () => {
    const sats = makeSats().map((s, i) => ({ ...s, id: i }));
    const H = buildHMatrix(sats, TRUE_POS);
    expect(H.length).toBe(SATELLITES.length);
  });

  it('each row has 4 elements [dx, dy, dz, 1]', () => {
    const sats = makeSats().map((s, i) => ({ ...s, id: i }));
    const H = buildHMatrix(sats, TRUE_POS);
    for (const row of H) {
      expect(row.length).toBe(4);
      expect(row[3]).toBe(1);
    }
  });

  it('unit vector components are within [-1, 1]', () => {
    const sats = makeSats().map((s, i) => ({ ...s, id: i }));
    const H = buildHMatrix(sats, TRUE_POS);
    for (const row of H) {
      expect(Math.abs(row[0])).toBeLessThanOrEqual(1);
      expect(Math.abs(row[1])).toBeLessThanOrEqual(1);
      expect(Math.abs(row[2])).toBeLessThanOrEqual(1);
    }
  });
});
