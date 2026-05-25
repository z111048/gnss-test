import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS_KM } from '../../utils/units';

const SCALE = 1 / 1000; // render scale: 1 unit = 1000 km

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const terminatorRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.025;
    }
    if (terminatorRef.current) {
      terminatorRef.current.rotation.z += delta * 0.02;
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
      <mesh ref={terminatorRef} rotation={[0.35, 0.15, 0]}>
        <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.006, 64, 64]} />
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Cloud / atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.02, 32, 32]} />
        <meshPhongMaterial
          color="#a8d8f0"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          emissive="#38bdf8"
          emissiveIntensity={0.35}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[EARTH_RADIUS_KM * SCALE, 64, 64]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
