import { GPSScene } from '../features/scene3d/GPSScene';
import { LessonStepper } from '../features/lesson/LessonStepper';
import { LessonPage } from '../features/lesson/LessonPage';

export function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-logo">🛰️</span>
        <h1>GPS 定位原理互動教案</h1>
        <span className="app-subtitle">互動式學習 GPS 如何從衛星訊號計算出你的位置</span>
      </header>

      <div className="app-body">
        {/* Left sidebar: chapter navigation */}
        <aside className="app-sidebar">
          <LessonStepper />
        </aside>

        {/* Center: 3D scene */}
        <main className="app-scene">
          <GPSScene />
        </main>

        {/* Right: lesson content + controls */}
        <section className="app-panel">
          <LessonPage />
        </section>
      </div>
    </div>
  );
}
