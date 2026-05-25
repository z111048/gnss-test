import * as THREE from 'three';
import type { SatelliteData } from '../gps-calculation/types';

const SCALE = 1 / 1000;

interface SignalSphereProps {
  satellite: SatelliteData;
  pseudorangeM: number; // meters
  opacity?: number;
}

export function SignalSphere({
  satellite,
  pseudorangeM,
  opacity = 0.12,
}: SignalSphereProps) {
  const pos: [number, number, number] = [
    satellite.position[0] * SCALE,
    satellite.position[1] * SCALE,
    satellite.position[2] * SCALE,
  ];
  const radiusScene = pseudorangeM / 1000 * SCALE; // convert m→km→scene units

  return (
    <mesh position={pos}>
      <sphereGeometry args={[radiusScene, 32, 32]} />
      <meshPhongMaterial
        color={satellite.color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
