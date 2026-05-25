import { useEffect, useMemo, useState } from 'react';
import { TRUE_RECEIVER_POSITION } from '../../data/demoSatellites';
import { getAnimatedSatellitePosition, isSatelliteObservable } from '../scene3d/orbitalMotion';
import { createSimulationSatellites } from './simulationSatellites';

export function SimulationDashboard() {
  const satellites = useMemo(() => createSimulationSatellites(), []);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const startedAt = performance.now();

    const update = () => {
      setElapsedTime((performance.now() - startedAt) / 1000);
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const observableCount = satellites.filter((satellite) =>
    isSatelliteObservable(
      getAnimatedSatellitePosition(satellite, elapsedTime),
      TRUE_RECEIVER_POSITION
    )
  ).length;

  return (
    <div className="simulation-dashboard">
      <div className="simulation-stat">
        <span>衛星總數</span>
        <strong>{satellites.length}</strong>
      </div>
      <div className="simulation-stat">
        <span>可觀測</span>
        <strong>{observableCount}</strong>
      </div>
      <div className="simulation-stat">
        <span>軌道面</span>
        <strong>6</strong>
      </div>
      <div className="simulation-stat">
        <span>接收器</span>
        <strong>Tokyo ECEF</strong>
      </div>
    </div>
  );
}
