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
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const pos: [number, number, number] = [
    position[0] * SCALE,
    position[1] * SCALE,
    position[2] * SCALE,
  ];

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (groupRef.current) {
      groupRef.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.8 + satellite.id) * 0.08;
    }
    if (haloRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4 + satellite.id) * 0.12;
      haloRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef} position={pos}>
      <pointLight color={color} intensity={0.75} distance={4} />
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
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
  tilt?: [number, number, number];
  spinSpeed?: number;
}

export function OrbitPath({
  radius,
  color = '#334155',
  opacity = 0.3,
  tilt = [0, 0, 0],
  spinSpeed = 0.015,
}: OrbitPathProps) {
  const lineRef = useRef<THREE.Line>(null);
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
  const material = new THREE.LineBasicMaterial({ color, opacity, transparent: true });

  useFrame((_, delta) => {
    if (lineRef.current) {
      lineRef.current.rotation.z += delta * spinSpeed;
    }
  });

  return (
    <primitive
      ref={lineRef}
      object={new THREE.Line(geometry, material)}
      rotation={tilt}
    />
  );
}
