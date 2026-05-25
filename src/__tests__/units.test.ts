import { describe, it, expect } from 'vitest';
import { C, EARTH_RADIUS_KM, GPS_ORBIT_RADIUS_KM, metersToKm, kmToMeters, nsToSeconds, secondsToNs } from '../utils/units';
import { fmt, fmtKm, fmtNs } from '../utils/formatNumber';

describe('units constants', () => {
  it('speed of light is 299,792,458 m/s', () => {
    expect(C).toBe(299792458);
  });

  it('Earth radius is approximately 6371 km', () => {
    expect(EARTH_RADIUS_KM).toBeCloseTo(6371, 0);
  });

  it('GPS orbit radius is ~26560 km (MEO)', () => {
    expect(GPS_ORBIT_RADIUS_KM).toBeGreaterThan(26000);
    expect(GPS_ORBIT_RADIUS_KM).toBeLessThan(27000);
  });
});

describe('unit conversions', () => {
  it('metersToKm divides by 1000', () => {
    expect(metersToKm(1000)).toBe(1);
    expect(metersToKm(500)).toBe(0.5);
  });

  it('kmToMeters multiplies by 1000', () => {
    expect(kmToMeters(1)).toBe(1000);
  });

  it('metersToKm and kmToMeters are inverse', () => {
    expect(kmToMeters(metersToKm(12345))).toBeCloseTo(12345, 5);
  });

  it('nsToSeconds divides by 1e9', () => {
    expect(nsToSeconds(1)).toBe(1e-9);
    expect(nsToSeconds(1000)).toBeCloseTo(1e-6, 12);
  });

  it('secondsToNs multiplies by 1e9', () => {
    expect(secondsToNs(1e-9)).toBeCloseTo(1, 5);
  });

  it('nsToSeconds and secondsToNs are inverse', () => {
    expect(secondsToNs(nsToSeconds(50))).toBeCloseTo(50, 5);
  });
});

describe('formatNumber', () => {
  it('fmt returns fixed decimal string', () => {
    expect(fmt(3.14159, 2)).toBe('3.14');
    expect(fmt(0, 3)).toBe('0.000');
  });

  it('fmtKm converts meters to km string', () => {
    expect(fmtKm(20000000)).toBe('20000.0 km');
    expect(fmtKm(1000)).toBe('1.0 km');
  });

  it('fmtNs converts seconds to nanoseconds string', () => {
    expect(fmtNs(1e-9)).toBe('1.0 ns');
    expect(fmtNs(67e-3)).toContain('ns');
  });
});
