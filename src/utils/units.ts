export const C = 299792458; // speed of light in m/s
export const EARTH_RADIUS_KM = 6371;
export const GPS_ORBIT_RADIUS_KM = 26560; // MEO altitude ~20200 km + Earth radius

export function metersToKm(m: number): number {
  return m / 1000;
}

export function kmToMeters(km: number): number {
  return km * 1000;
}

export function nsToSeconds(ns: number): number {
  return ns * 1e-9;
}

export function secondsToNs(s: number): number {
  return s * 1e9;
}
