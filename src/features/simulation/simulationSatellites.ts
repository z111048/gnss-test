import type { SatelliteData } from '../gps-calculation/types';
import { GPS_ORBIT_RADIUS_KM } from '../../utils/units';

const COLORS = ['#22d3ee', '#34d399', '#f59e0b', '#a78bfa', '#f472b6', '#60a5fa'];

export function createSimulationSatellites(): SatelliteData[] {
  const satellites: SatelliteData[] = [];
  const planes = 6;
  const satellitesPerPlane = 4;

  for (let plane = 0; plane < planes; plane++) {
    const rightAscension = (plane / planes) * Math.PI * 2;
    const inclination = 55 * (Math.PI / 180);

    for (let slot = 0; slot < satellitesPerPlane; slot++) {
      const argument = ((slot / satellitesPerPlane) * Math.PI * 2) + plane * 0.18;
      const orbitalX = Math.cos(argument) * GPS_ORBIT_RADIUS_KM;
      const orbitalY = Math.sin(argument) * GPS_ORBIT_RADIUS_KM;

      const x =
        orbitalX * Math.cos(rightAscension) -
        orbitalY * Math.cos(inclination) * Math.sin(rightAscension);
      const y =
        orbitalX * Math.sin(rightAscension) +
        orbitalY * Math.cos(inclination) * Math.cos(rightAscension);
      const z = orbitalY * Math.sin(inclination);
      const id = plane * satellitesPerPlane + slot + 1;

      satellites.push({
        id,
        label: `GPS-${String(id).padStart(2, '0')}`,
        position: [x, y, z],
        clockBias: 0,
        visible: true,
        color: COLORS[plane % COLORS.length],
      });
    }
  }

  return satellites;
}
