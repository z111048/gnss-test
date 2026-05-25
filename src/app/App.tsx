import { useState } from 'react';
import { GPSScene } from '../features/scene3d/GPSScene';
import { LessonStepper } from '../features/lesson/LessonStepper';
import { LessonPage } from '../features/lesson/LessonPage';
import { SimulationDashboard } from '../features/simulation/SimulationDashboard';

export function App() {
  const [mode, setMode] = useState<'lesson' | 'simulation'>('lesson');
  const isSimulation = mode === 'simulation';

  return (
    <div className={`app-layout ${isSimulation ? 'simulation-mode' : ''}`}>
      <header className="app-header">
        <span className="app-logo">🛰️</span>
        <h1>{isSimulation ? 'GNSS 軌道實況模擬' : 'GPS 定位原理互動教案'}</h1>
        <div className="mode-switch" aria-label="顯示模式">
          <button
            className={mode === 'lesson' ? 'active' : ''}
            onClick={() => setMode('lesson')}
          >
            教學
          </button>
          <button
            className={mode === 'simulation' ? 'active' : ''}
            onClick={() => setMode('simulation')}
          >
            模擬
          </button>
        </div>
        <span className="app-subtitle">
          {isSimulation
            ? '多軌道、多衛星、地球遮蔽與可觀測性'
            : '互動式學習 GPS 如何從衛星訊號計算出你的位置'}
        </span>
      </header>

      <div className="app-body">
        {/* Left sidebar: chapter navigation */}
        {!isSimulation && (
          <aside className="app-sidebar">
            <LessonStepper />
          </aside>
        )}

        {/* Center: 3D scene */}
        <main className="app-scene">
          {isSimulation && <SimulationDashboard />}
          <GPSScene mode={mode} />
        </main>

        {/* Right: lesson content + controls */}
        {!isSimulation && (
          <section className="app-panel">
            <LessonPage />
          </section>
        )}
      </div>
    </div>
  );
}
