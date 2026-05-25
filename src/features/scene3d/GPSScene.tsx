import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Earth } from './Earth';
import { Satellite, OrbitPath } from './Satellite';
import { Receiver } from './Receiver';
import { SignalSphere } from './SignalSphere';
import { AnimatedSignalLine } from './ResidualVector';
import { useGPSStore } from '../../store/gpsStore';
import { generatePseudorange } from '../gps-calculation/pseudorange';
import { GPS_ORBIT_RADIUS_KM } from '../../utils/units';
import { createSimulationSatellites } from '../simulation/simulationSatellites';

interface GPSSceneProps {
  mode?: 'lesson' | 'simulation';
}

export function GPSScene({ mode = 'lesson' }: GPSSceneProps) {
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

  const simulationMode = mode === 'simulation';
  const sceneSatellites = simulationMode
    ? createSimulationSatellites()
    : satellites;
  const shouldShowOrbitPaths = simulationMode || showOrbitPaths;
  const shouldShowSignalLines = simulationMode || showSignalLines;
  const shouldShowSpheres = simulationMode || showSpheres;
  const clockBiasS = clockBiasNs * 1e-9;
  const visibleSats = sceneSatellites.filter((s) => s.visible);

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
      <fog attach="fog" args={['#020617', 55, 145]} />
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 50, 50]} intensity={1.2} />
      <pointLight position={[-50, -50, -50]} intensity={0.6} color="#4040ff" />

      {/* Stars background */}
      <Stars radius={220} depth={60} count={simulationMode ? 6000 : 3000} factor={4} saturation={0} />

      {/* Earth */}
      <Earth />

      {/* Orbit paths */}
      {shouldShowOrbitPaths && (
        <>
          {(simulationMode
            ? [0, 1, 2, 3, 4, 5]
            : [0, 1]
          ).map((plane) => (
            <OrbitPath
              key={plane}
              radius={GPS_ORBIT_RADIUS_KM}
              color={plane % 2 === 0 ? '#1e3a5f' : '#38bdf8'}
              opacity={simulationMode ? 0.18 : plane === 0 ? 0.4 : 0.22}
              tilt={[
                (55 * Math.PI) / 180,
                (plane / 6) * Math.PI * 2,
                plane * 0.12,
              ]}
              spinSpeed={simulationMode ? 0.004 + plane * 0.001 : plane === 0 ? 0.015 : -0.01}
              phase={plane * 0.35}
            />
          ))}
        </>
      )}

      {/* Satellites */}
      {sceneSatellites.map((sat) =>
        sat.visible ? (
          <Satellite
            key={sat.id}
            satellite={sat}
            observerPosition={trueReceiverPos}
          />
        ) : null
      )}

      {/* Signal lines */}
      {shouldShowSignalLines &&
        visibleSats.map((sat) => (
          <AnimatedSignalLine
            key={sat.id}
            from={sat.position}
            to={trueReceiverPos}
            color={sat.color}
            opacity={0.35}
            phase={sat.id * 0.17}
            satellite={sat}
          />
        ))}

      {/* Signal spheres (pseudorange visualization) */}
      {shouldShowSpheres &&
        visibleSats.map((sat) => {
          const pr = generatePseudorange(
            sat.position,
            trueReceiverPos,
            clockBiasS
          );
          return (
            <SignalSphere
              key={sat.id}
              satellite={sat}
              pseudorangeM={pr}
              receiverPosition={trueReceiverPos}
              clockBiasS={clockBiasS}
            />
          );
        })}

      {/* True receiver */}
      <Receiver
        position={trueReceiverPos}
        color="#ef4444"
        label="真實位置"
      />

      {/* Estimated position (iteration steps) */}
      {!simulationMode && currentEstimatePos && (
        <Receiver
          position={currentEstimatePos}
          color="#fbbf24"
          label="估計位置"
          size={0.04}
        />
      )}

      {/* Final estimated position */}
      {!simulationMode && estimatedPos && !currentEstimatePos && (
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
