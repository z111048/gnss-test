import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Earth } from './Earth';
import { Satellite, OrbitPath } from './Satellite';
import { Receiver } from './Receiver';
import { SignalSphere } from './SignalSphere';
import { SignalLine } from './ResidualVector';
import { useGPSStore } from '../../store/gpsStore';
import { generatePseudorange } from '../gps-calculation/pseudorange';
import { GPS_ORBIT_RADIUS_KM } from '../../utils/units';

export function GPSScene() {
  const {
    satellites,
    showSpheres,
    showSignalLines,
    showOrbitPaths,
    trueReceiverPos,
    estimatedPos,
    clockBiasNs,
    iterationSteps,
    currentIteration,
  } = useGPSStore();

  const clockBiasS = clockBiasNs * 1e-9;
  const visibleSats = satellites.filter((s) => s.visible);

  const currentEstimatePos =
    iterationSteps.length > 0
      ? ([
          iterationSteps[Math.min(currentIteration, iterationSteps.length - 1)].x,
          iterationSteps[Math.min(currentIteration, iterationSteps.length - 1)].y,
          iterationSteps[Math.min(currentIteration, iterationSteps.length - 1)].z,
        ] as [number, number, number])
      : null;

  return (
    <Canvas
      camera={{ position: [0, 0, 60], fov: 45 }}
      style={{ background: '#020617' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 50, 50]} intensity={1.2} />
      <pointLight position={[-50, -50, -50]} intensity={0.3} color="#4040ff" />

      {/* Stars background */}
      <Stars radius={200} depth={50} count={3000} factor={4} saturation={0} />

      {/* Earth */}
      <Earth />

      {/* Orbit paths */}
      {showOrbitPaths && (
        <>
          <OrbitPath radius={GPS_ORBIT_RADIUS_KM} color="#1e3a5f" opacity={0.4} />
          <OrbitPath radius={GPS_ORBIT_RADIUS_KM} color="#1e3a5f" opacity={0.2} />
        </>
      )}

      {/* Satellites */}
      {satellites.map((sat) =>
        sat.visible ? <Satellite key={sat.id} satellite={sat} /> : null
      )}

      {/* Signal lines */}
      {showSignalLines &&
        visibleSats.map((sat) => (
          <SignalLine
            key={sat.id}
            from={sat.position}
            to={trueReceiverPos}
            color={sat.color}
            opacity={0.35}
          />
        ))}

      {/* Signal spheres (pseudorange visualization) */}
      {showSpheres &&
        visibleSats.map((sat) => {
          const pr = generatePseudorange(
            sat.position,
            trueReceiverPos,
            clockBiasS
          );
          return (
            <SignalSphere key={sat.id} satellite={sat} pseudorangeM={pr} />
          );
        })}

      {/* True receiver */}
      <Receiver
        position={trueReceiverPos}
        color="#ef4444"
        label="真實位置"
      />

      {/* Estimated position (iteration steps) */}
      {currentEstimatePos && (
        <Receiver
          position={currentEstimatePos}
          color="#fbbf24"
          label="估計位置"
          size={0.04}
        />
      )}

      {/* Final estimated position */}
      {estimatedPos && !currentEstimatePos && (
        <Receiver
          position={estimatedPos}
          color="#4ade80"
          label="估計位置"
          size={0.04}
        />
      )}

      <OrbitControls makeDefault enablePan enableZoom enableRotate />
    </Canvas>
  );
}
