import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhongMaterial>(null);
  const pos: [number, number, number] = [
    satellite.position[0] * SCALE,
    satellite.position[1] * SCALE,
    satellite.position[2] * SCALE,
  ];
  const radiusScene = pseudorangeM / 1000 * SCALE; // convert m→km→scene units

  useFrame((state) => {
    const phase = state.clock.elapsedTime * 1.4 + satellite.id;
    const pulse = 1 + Math.sin(phase) * 0.015;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(pulse);
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity + Math.max(0, Math.sin(phase)) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[radiusScene, 32, 32]} />
      <meshPhongMaterial
        ref={materialRef}
        color={satellite.color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        emissive={satellite.color}
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}
