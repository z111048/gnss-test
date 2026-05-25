import { describe, it, expect } from 'vitest';
import { ecefToGeodetic, geodeticToEcef } from '../features/gps-calculation/ecef';

describe('ecefToGeodetic', () => {
  it('converts ECEF origin to correct geodetic values', () => {
    // Point on equator at prime meridian (lat=0, lon=0)
    const { lat, lon } = ecefToGeodetic(6378.137, 0, 0);
    expect(lat).toBeCloseTo(0, 3);
    expect(lon).toBeCloseTo(0, 3);
  });

  it('converts North Pole correctly', () => {
    const { lat } = ecefToGeodetic(0, 0, 6356.752);
    expect(lat).toBeCloseTo(90, 1);
  });

  it('converts a known city — Tokyo (approx)', () => {
    // Tokyo ECEF approx: [-3954, 3354, 3700] km
    const { lat, lon } = ecefToGeodetic(-3954, 3354, 3700);
    expect(lat).toBeGreaterThan(30);
    expect(lat).toBeLessThan(40);
    expect(lon).toBeGreaterThan(130);
    expect(lon).toBeLessThan(145);
  });

  it('altitude on Earth surface is near 0', () => {
    const { alt } = ecefToGeodetic(6378.137, 0, 0);
    expect(Math.abs(alt)).toBeLessThan(0.1); // < 100m
  });
});

describe('geodeticToEcef', () => {
  it('converts equator prime meridian to ECEF', () => {
    const [x, y, z] = geodeticToEcef(0, 0, 0);
    expect(x).toBeCloseTo(6378.137, 1);
    expect(y).toBeCloseTo(0, 3);
    expect(z).toBeCloseTo(0, 3);
  });

  it('round-trips: ECEF → geodetic → ECEF', () => {
    const original: [number, number, number] = [-3954, 3354, 3700];
    const { lat, lon, alt } = ecefToGeodetic(...original);
    const [x, y, z] = geodeticToEcef(lat, lon, alt);
    expect(x).toBeCloseTo(original[0], 0);
    expect(y).toBeCloseTo(original[1], 0);
    expect(z).toBeCloseTo(original[2], 0);
  });

  it('higher altitude gives larger ECEF magnitude', () => {
    const [x0] = geodeticToEcef(0, 0, 0);
    const [x1] = geodeticToEcef(0, 0, 1000); // 1000 km altitude
    expect(x1).toBeGreaterThan(x0);
  });
});
