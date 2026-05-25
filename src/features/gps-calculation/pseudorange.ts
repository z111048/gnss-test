import { C } from '../../utils/units';

/**
 * Compute pseudorange from time difference.
 * rho = c * delta_t
 */
export function timeDiffToPseudorange(timeDiff: number): number {
  return C * timeDiff;
}

/**
 * Compute true geometric distance between two ECEF points (in km).
 * Returns distance in km.
 */
export function ecefDistanceKm(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Compute true geometric distance between two ECEF points (in meters).
 */
export function ecefDistanceM(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return ecefDistanceKm(a, b) * 1000;
}

/**
 * Generate a pseudorange observation given:
 * - satellite position (ECEF km)
 * - receiver true position (ECEF km)
 * - receiver clock bias (seconds)
 * - optional noise (meters)
 */
export function generatePseudorange(
  satPos: [number, number, number],
  receiverPos: [number, number, number],
  receiverClockBias: number,
  noiseSigma = 0
): number {
  const trueRangeM = ecefDistanceM(satPos, receiverPos);
  const biasM = receiverClockBias * C;
  const noise = noiseSigma > 0 ? (Math.random() - 0.5) * 2 * noiseSigma : 0;
  return trueRangeM + biasM + noise;
}
