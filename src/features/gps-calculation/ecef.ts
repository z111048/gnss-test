/**
 * Convert ECEF coordinates (km) to geodetic (latitude, longitude in degrees, altitude in km).
 */
export function ecefToGeodetic(
  x: number,
  y: number,
  z: number
): { lat: number; lon: number; alt: number } {
  const a = 6378.137; // Earth semi-major axis km
  const f = 1 / 298.257223563;
  const b = a * (1 - f);
  const e2 = 1 - (b * b) / (a * a);
  const lon = Math.atan2(y, x) * (180 / Math.PI);
  const p = Math.sqrt(x * x + y * y);
  let lat = Math.atan2(z, p * (1 - e2));
  for (let i = 0; i < 10; i++) {
    const sinLat = Math.sin(lat);
    const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
    lat = Math.atan2(z + e2 * N * sinLat, p);
  }
  const sinLat = Math.sin(lat);
  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const alt = p / Math.cos(lat) - N;
  return { lat: lat * (180 / Math.PI), lon, alt };
}

/**
 * Convert geodetic (degrees, km alt) to ECEF (km).
 */
export function geodeticToEcef(
  lat: number,
  lon: number,
  alt: number
): [number, number, number] {
  const a = 6378.137;
  const f = 1 / 298.257223563;
  const b = a * (1 - f);
  const e2 = 1 - (b * b) / (a * a);
  const latR = lat * (Math.PI / 180);
  const lonR = lon * (Math.PI / 180);
  const sinLat = Math.sin(latR);
  const cosLat = Math.cos(latR);
  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const x = (N + alt) * cosLat * Math.cos(lonR);
  const y = (N + alt) * cosLat * Math.sin(lonR);
  const z = (N * (1 - e2) + alt) * sinLat;
  return [x, y, z];
}
