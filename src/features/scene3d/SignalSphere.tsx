import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SatelliteData } from '../gps-calculation/types';
import { C } from '../../utils/units';
import { getAnimatedSatellitePosition, isSatelliteObservable } from './orbitalMotion';

const SCALE = 1 / 1000;

interface SignalSphereProps {
  satellite: SatelliteData;
  pseudorangeM: number; // meters
  receiverPosition: [number, number, number];
  clockBiasS?: number;
  opacity?: number;
}

export function SignalSphere({
  satellite,
  pseudorangeM,
  receiverPosition,
  clockBiasS = 0,
  opacity = 0.12,
}: SignalSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhongMaterial>(null);

  useFrame((state) => {
    const phase = state.clock.elapsedTime * 1.4 + satellite.id;
    const pulse = 1 + Math.sin(phase) * 0.015;
    if (meshRef.current) {
      const position = getAnimatedSatellitePosition(satellite, state.clock.elapsedTime);
      const observable = isSatelliteObservable(position, receiverPosition);
      const satelliteVector = new THREE.Vector3(...position);
      const receiverVector = new THREE.Vector3(...receiverPosition);
      const dynamicPseudorangeM =
        satelliteVector.distanceTo(receiverVector) * 1000 + C * clockBiasS;
      const radiusScene = (dynamicPseudorangeM || pseudorangeM) / 1000 * SCALE;

      meshRef.current.visible = observable;
      meshRef.current.position.set(
        position[0] * SCALE,
        position[1] * SCALE,
        position[2] * SCALE
      );
      meshRef.current.scale.setScalar(radiusScene * pulse);
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity + Math.max(0, Math.sin(phase)) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
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
