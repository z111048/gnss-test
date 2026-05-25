import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS_KM } from '../../utils/units';

const SCALE = 1 / 1000; // render scale: 1 unit = 1000 km

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS_KM * SCALE, 64, 64]} />
        <meshPhongMaterial
          color="#1a6b9a"
          emissive="#0a2a3a"
          specular="#ffffff"
          shininess={30}
        />
      </mesh>
      {/* Cloud / atmosphere glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.02, 32, 32]} />
        <meshPhongMaterial
          color="#a8d8f0"
          transparent
          opacity={0.08}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}
