import { Html } from '@react-three/drei';

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
  const pos: [number, number, number] = [
    position[0] * SCALE,
    position[1] * SCALE,
    position[2] * SCALE,
  ];

  return (
    <group position={pos}>
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
