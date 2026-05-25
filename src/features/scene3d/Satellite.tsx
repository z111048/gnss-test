import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { SatelliteData } from '../gps-calculation/types';

const SCALE = 1 / 1000;

interface SatelliteProps {
  satellite: SatelliteData;
  showLabel?: boolean;
}

export function Satellite({ satellite, showLabel = true }: SatelliteProps) {
  const { position, color, label } = satellite;
  const meshRef = useRef<THREE.Mesh>(null);
  const pos: [number, number, number] = [
    position[0] * SCALE,
    position[1] * SCALE,
    position[2] * SCALE,
  ];

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group position={pos}>
      {/* Main body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.06, 0.06, 0.15]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Solar panels */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.4, 0.03, 0.08]} />
        <meshPhongMaterial color="#334155" emissive="#1e3a5f" emissiveIntensity={0.2} />
      </mesh>
      {/* Label */}
      {showLabel && (
        <Html distanceFactor={3} center>
          <div
            style={{
              color: color,
              fontSize: '11px',
              fontWeight: 'bold',
              textShadow: '0 0 4px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              transform: 'translateY(-20px)',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

interface OrbitPathProps {
  radius: number; // km
  color?: string;
  opacity?: number;
}

export function OrbitPath({ radius, color = '#334155', opacity = 0.3 }: OrbitPathProps) {
  const points: THREE.Vector3[] = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius * SCALE,
        0,
        Math.sin(angle) * radius * SCALE
      )
    );
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, opacity, transparent: true }))} />
  );
}
