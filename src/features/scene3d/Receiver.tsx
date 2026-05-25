import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const SCALE = 1 / 1000;

interface ReceiverProps {
  position: [number, number, number]; // ECEF km
  color?: string;
  label?: string;
  size?: number;
}

export function Receiver({
  position,
  color = '#ef4444',
  label = '接收器',
  size = 0.05,
}: ReceiverProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pos: [number, number, number] = [
    position[0] * SCALE,
    position[1] * SCALE,
    position[2] * SCALE,
  ];

  useFrame((state) => {
    if (ringRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.18;
      ringRef.current.scale.setScalar(pulse);
      ringRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 2.5, size * 0.08, 8, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Html distanceFactor={3} center>
        <div
          style={{
            color: color,
            fontSize: '11px',
            fontWeight: 'bold',
            textShadow: '0 0 4px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            transform: 'translateY(-18px)',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
