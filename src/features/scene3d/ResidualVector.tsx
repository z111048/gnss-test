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
