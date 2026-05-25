import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { SatelliteData } from '../gps-calculation/types';
import { getAnimatedSatellitePosition, isSatelliteObservable } from './orbitalMotion';

const SCALE = 1 / 1000;

interface SatelliteProps {
  satellite: SatelliteData;
  observerPosition: [number, number, number];
  showLabel?: boolean;
}

export function Satellite({ satellite, observerPosition, showLabel = true }: SatelliteProps) {
  const { color, label } = satellite;
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const bodyMaterialRef = useRef<THREE.MeshPhongMaterial>(null);
  const panelMaterialRef = useRef<THREE.MeshPhongMaterial>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const observableRef = useRef(true);
  const [isObservable, setIsObservable] = useState(true);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (groupRef.current) {
      const position = getAnimatedSatellitePosition(satellite, state.clock.elapsedTime);
      const observable = isSatelliteObservable(position, observerPosition);
      groupRef.current.position.set(
        position[0] * SCALE,
        position[1] * SCALE + Math.sin(state.clock.elapsedTime * 0.8 + satellite.id) * 0.08,
        position[2] * SCALE
      );

      if (observableRef.current !== observable) {
        observableRef.current = observable;
        setIsObservable(observable);
      }
      if (bodyMaterialRef.current) {
        bodyMaterialRef.current.opacity = observable ? 1 : 0.28;
        bodyMaterialRef.current.emissiveIntensity = observable ? 0.3 : 0.04;
      }
      if (panelMaterialRef.current) {
        panelMaterialRef.current.opacity = observable ? 1 : 0.22;
      }
      if (haloMaterialRef.current) {
        haloMaterialRef.current.opacity = observable ? 0.12 : 0.02;
      }
      if (lightRef.current) {
        lightRef.current.intensity = observable ? 0.75 : 0.08;
      }
    }
    if (haloRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4 + satellite.id) * 0.12;
      haloRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight ref={lightRef} color={color} intensity={0.75} distance={4} />
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
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
        <meshPhongMaterial
          ref={bodyMaterialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
        />
      </mesh>
      {/* Solar panels */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.4, 0.03, 0.08]} />
        <meshPhongMaterial
          ref={panelMaterialRef}
          color="#334155"
          emissive="#1e3a5f"
          emissiveIntensity={0.2}
          transparent
        />
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
              opacity: isObservable ? 1 : 0.35,
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
  phase?: number;
}

export function OrbitPath({
  radius,
  color = '#334155',
  opacity = 0.3,
  tilt = [0, 0, 0],
  spinSpeed = 0.015,
  phase = 0,
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
      lineRef.current.rotation.y += delta * spinSpeed * 0.4;
    }
  });

  return (
    <primitive
      ref={lineRef}
      object={new THREE.Line(geometry, material)}
      rotation={[tilt[0], tilt[1] + phase, tilt[2]]}
    />
  );
}
