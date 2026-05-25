import type { SatelliteData } from '../features/gps-calculation/types';
import { GPS_ORBIT_RADIUS_KM } from '../utils/units';

/**
 * Demo satellites positioned at GPS MEO orbit (~26560 km from Earth center).
 * Coordinates are in ECEF (km).
 */
export const DEMO_SATELLITES: SatelliteData[] = [
  {
    id: 1,
    label: 'SVN-1',
    position: [GPS_ORBIT_RADIUS_KM, 0, 0],
    clockBias: 0,
    visible: true,
    color: '#f59e0b',
  },
  {
    id: 2,
    label: 'SVN-2',
    position: [0, GPS_ORBIT_RADIUS_KM, 0],
    clockBias: 0,
    visible: true,
    color: '#22d3ee',
  },
  {
    id: 3,
    label: 'SVN-3',
    position: [-GPS_ORBIT_RADIUS_KM * 0.5, 0, GPS_ORBIT_RADIUS_KM * 0.866],
    clockBias: 0,
    visible: true,
    color: '#a78bfa',
  },
  {
    id: 4,
    label: 'SVN-4',
    position: [
      -GPS_ORBIT_RADIUS_KM * 0.5,
      GPS_ORBIT_RADIUS_KM * 0.866,
      -GPS_ORBIT_RADIUS_KM * 0.5,
    ],
    clockBias: 0,
    visible: true,
    color: '#34d399',
  },
  {
    id: 5,
    label: 'SVN-5',
    position: [
      GPS_ORBIT_RADIUS_KM * 0.7,
      -GPS_ORBIT_RADIUS_KM * 0.5,
      GPS_ORBIT_RADIUS_KM * 0.5,
    ],
    clockBias: 0,
    visible: false,
    color: '#fb923c',
  },
  {
    id: 6,
    label: 'SVN-6',
    position: [
      -GPS_ORBIT_RADIUS_KM * 0.3,
      -GPS_ORBIT_RADIUS_KM * 0.8,
      GPS_ORBIT_RADIUS_KM * 0.3,
    ],
    clockBias: 0,
    visible: false,
    color: '#f472b6',
  },
];

/** True receiver position (Tokyo, Japan approx ECEF km) */
export const TRUE_RECEIVER_POSITION: [number, number, number] = [
  -3954, 3354, 3700,
];
