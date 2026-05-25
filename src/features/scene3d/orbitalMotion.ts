import * as THREE from 'three';
import type { SatelliteData } from '../gps-calculation/types';

const ORBIT_AXES = [
  new THREE.Vector3(0, 1, 0).normalize(),
  new THREE.Vector3(0.35, 0.85, 0.38).normalize(),
  new THREE.Vector3(-0.45, 0.55, 0.7).normalize(),
  new THREE.Vector3(0.72, 0.22, -0.66).normalize(),
];

export function getAnimatedSatellitePosition(
  satellite: SatelliteData,
  elapsedTime: number
): [number, number, number] {
  const axis = ORBIT_AXES[(satellite.id - 1) % ORBIT_AXES.length];
  const speed = 0.018 + (satellite.id % 3) * 0.004;
  const angle = elapsedTime * speed + satellite.id * 0.2;
  const vector = new THREE.Vector3(...satellite.position).applyAxisAngle(axis, angle);

  return [vector.x, vector.y, vector.z];
}

export function isSatelliteObservable(
  satellitePosition: [number, number, number],
  receiverPosition: [number, number, number]
): boolean {
  const receiver = new THREE.Vector3(...receiverPosition);
  const satellite = new THREE.Vector3(...satellitePosition);
  const localUp = receiver.clone().normalize();
  const lineOfSight = satellite.sub(receiver).normalize();

  return lineOfSight.dot(localUp) > 0;
}
