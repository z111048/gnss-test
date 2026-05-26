import type { IterationStep } from './types';

interface SatPos {
  position: [number, number, number]; // ECEF km
  pseudorange: number; // meters
  label?: string;
}

/**
 * Iterative least-squares GPS position solver.
 * Works internally in meters for numerical stability.
 * Returns an array of iteration steps (position stored back in km).
 *
 * State vector: [x_m, y_m, z_m, B_m]
 */
export function solveLeastSquares(
  satellites: SatPos[],
  initialGuess: [number, number, number] = [0, 0, 0],
  maxIterations = 10,
  convergenceThreshold = 0.01 // meters
): IterationStep[] {
  const steps: IterationStep[] = [];
  // Work in meters
  let xm = initialGuess[0] * 1000;
  let ym = initialGuess[1] * 1000;
  let zm = initialGuess[2] * 1000;
  let B = 0; // clock bias equivalent in meters

  for (let iter = 0; iter < maxIterations; iter++) {
    const n = satellites.length;
    const H: number[][] = [];
    const v: number[] = [];
    const observations = [];

    for (let i = 0; i < satellites.length; i++) {
      const sat = satellites[i];
      const xim = sat.position[0] * 1000;
      const yim = sat.position[1] * 1000;
      const zim = sat.position[2] * 1000;
      const dx = xm - xim;
      const dy = ym - yim;
      const dz = zm - zim;
      const distM = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const predicted = distM + B;
      const residual = sat.pseudorange - predicted;
      v.push(residual);
      // H row: ∂(predicted_m)/∂[x_m, y_m, z_m, B_m]
      H.push([dx / distM, dy / distM, dz / distM, 1]);
      observations.push({
        satelliteLabel: sat.label ?? `SV-${i + 1}`,
        observedPseudorange: sat.pseudorange,
        predictedPseudorange: predicted,
        residual,
        geometricDistance: distM,
      });
    }

    // Δ = (H^T H)^{-1} H^T v  — all in meters
    const { normalMatrix, normalVector } = buildNormalEquations(H, v);
    const delta = gaussianElimination(
      normalMatrix.map((row) => [...row]),
      [...normalVector]
    ) as [number, number, number, number];
    const residualNorm = Math.sqrt(v.reduce((s, r) => s + r * r, 0) / n);

    steps.push({
      iteration: iter,
      x: xm / 1000, // back to km for display
      y: ym / 1000,
      z: zm / 1000,
      B,
      residualNorm,
      delta,
      updatedState: [
        (xm + delta[0]) / 1000,
        (ym + delta[1]) / 1000,
        (zm + delta[2]) / 1000,
        B + delta[3],
      ],
      observations,
      hMatrix: H,
      normalMatrix,
      normalVector,
    });

    xm += delta[0];
    ym += delta[1];
    zm += delta[2];
    B += delta[3];

    const posChange = Math.sqrt(delta[0] ** 2 + delta[1] ** 2 + delta[2] ** 2);
    if (posChange < convergenceThreshold) {
      steps.push({
        iteration: iter + 1,
        x: xm / 1000,
        y: ym / 1000,
        z: zm / 1000,
        B,
        residualNorm: 0,
        delta: [0, 0, 0, 0],
        updatedState: [xm / 1000, ym / 1000, zm / 1000, B],
      });
      break;
    }
  }

  return steps;
}

/**
 * Solve normal equations (H^T H) Δ = H^T v using Gaussian elimination.
 */
function buildNormalEquations(
  H: number[][],
  v: number[]
): { normalMatrix: number[][]; normalVector: number[] } {
  const m = H.length;
  const n = H[0].length;
  const normalMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const normalVector: number[] = Array(n).fill(0);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      normalVector[j] += H[i][j] * v[i];
      for (let k = 0; k < n; k++) {
        normalMatrix[j][k] += H[i][j] * H[i][k];
      }
    }
  }

  return { normalMatrix, normalVector };
}

function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length;
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let k = col; k <= n; k++) {
        aug[row][k] -= factor * aug[col][k];
      }
    }
  }

  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j];
    }
    x[i] /= aug[i][i];
  }

  return x;
}

/**
 * Build the H matrix for display (one row per satellite).
 * Uses unit vector components from receiver toward each satellite.
 */
export function buildHMatrix(
  satellites: SatPos[],
  receiverPos: [number, number, number]
): number[][] {
  const [xkm, ykm, zkm] = receiverPos;
  return satellites.map((sat) => {
    const [xi, yi, zi] = sat.position;
    const dx = xkm - xi;
    const dy = ykm - yi;
    const dz = zkm - zi;
    const distKm = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return [dx / distKm, dy / distKm, dz / distKm, 1];
  });
}
