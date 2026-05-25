import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SCALE = 1 / 1000;

interface SignalLineProps {
  from: [number, number, number]; // ECEF km
  to: [number, number, number]; // ECEF km
  color?: string;
  opacity?: number;
}

export function SignalLine({ from, to, color = '#ffffff', opacity = 0.4 }: SignalLineProps) {
  const points = [
    new THREE.Vector3(from[0] * SCALE, from[1] * SCALE, from[2] * SCALE),
    new THREE.Vector3(to[0] * SCALE, to[1] * SCALE, to[2] * SCALE),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, opacity, transparent: true });
  return <primitive object={new THREE.Line(geometry, material)} />;
}

interface AnimatedSignalLineProps extends SignalLineProps {
  phase?: number;
  speed?: number;
}

export function AnimatedSignalLine({
  from,
  to,
  color = '#ffffff',
  opacity = 0.4,
  phase = 0,
  speed = 0.45,
}: AnimatedSignalLineProps) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Line>(null);

  const { start, end, geometry, material, tailMaterial } = useMemo(() => {
    const start = new THREE.Vector3(from[0] * SCALE, from[1] * SCALE, from[2] * SCALE);
    const end = new THREE.Vector3(to[0] * SCALE, to[1] * SCALE, to[2] * SCALE);
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const tailMaterial = new THREE.LineBasicMaterial({
      color,
      opacity: Math.min(0.9, opacity + 0.25),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { start, end, geometry, material, tailMaterial };
  }, [color, from, opacity, to]);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * speed + phase) % 1;
    const pulsePos = new THREE.Vector3().lerpVectors(start, end, t);
    const tailStart = new THREE.Vector3().lerpVectors(start, end, Math.max(0, t - 0.12));
    const tailEnd = new THREE.Vector3().lerpVectors(start, end, t);

    if (pulseRef.current) {
      pulseRef.current.position.copy(pulsePos);
      const scale = 0.75 + Math.sin(state.clock.elapsedTime * 8 + phase) * 0.15;
      pulseRef.current.scale.setScalar(scale);
    }
    if (tailRef.current) {
      tailRef.current.geometry.dispose();
      tailRef.current.geometry = new THREE.BufferGeometry().setFromPoints([tailStart, tailEnd]);
    }
  });

  return (
    <>
      <primitive object={new THREE.Line(geometry, material)} />
      <primitive ref={tailRef} object={new THREE.Line(new THREE.BufferGeometry(), tailMaterial)} />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

interface ResidualVectorProps {
  from: [number, number, number]; // ECEF km
  to: [number, number, number]; // ECEF km
  color?: string;
}

export function ResidualVector({ from, to, color = '#f59e0b' }: ResidualVectorProps) {
  const start = new THREE.Vector3(from[0] * SCALE, from[1] * SCALE, from[2] * SCALE);
  const end = new THREE.Vector3(to[0] * SCALE, to[1] * SCALE, to[2] * SCALE);
  const direction = end.clone().sub(start);
  const length = direction.length();
  if (length < 0.001) return null;

  const points = [start, end];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color });
  return <primitive object={new THREE.Line(geometry, material)} />;
}
