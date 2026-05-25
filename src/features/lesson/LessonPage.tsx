import { useEffect } from 'react';
import { LESSON_CONTENTS, LESSONS } from './lessonContent';
import { useGPSStore } from '../../store/gpsStore';
import { FormulaBlock } from '../calculator-panel/FormulaBlock';
import { ValueInspector } from '../calculator-panel/ValueInspector';
import { IterationTable } from '../calculator-panel/IterationTable';
import { MatrixTable } from '../calculator-panel/MatrixTable';
import { timeDiffToPseudorange } from '../gps-calculation/pseudorange';
import { ecefToGeodetic } from '../gps-calculation/ecef';
import { buildHMatrix } from '../gps-calculation/leastSquares';
import { C } from '../../utils/units';

export function LessonPage() {
  const store = useGPSStore();
  const content = LESSON_CONTENTS.find((c) => c.id === store.currentLesson);
  const meta = LESSONS.find((l) => l.id === store.currentLesson);

  // Apply scene hints when lesson changes
  useEffect(() => {
    if (!content) return;
    store.setShowSpheres(content.sceneHints.showSpheres ?? false);
    store.setShowSignalLines(content.sceneHints.showSignalLines ?? true);
    store.setShowOrbitPaths(content.sceneHints.showOrbitPaths ?? false);
    store.setShowResiduals(content.sceneHints.showResiduals ?? false);
    // Activate required satellites
    if (content.sceneHints.activeSatCount !== undefined) {
      const count = content.sceneHints.activeSatCount;
      store.satellites.forEach((s) => {
        const shouldBeVisible = s.id <= count;
        if (s.visible !== shouldBeVisible) {
          store.toggleSatellite(s.id);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentLesson]);

  if (!content || !meta) return null;

  return (
    <div className="lesson-page">
      {/* Description panel */}
      <div className="lesson-description">
        <h2>
          {meta.icon} {meta.title}
        </h2>
        <p className="lesson-subtitle">{meta.subtitle}</p>
        <div className="lesson-body">
          {content.description.map((line, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: markdownBold(line) }} />
          ))}
        </div>
        {content.formula && (
          <div className="lesson-formula">
            <FormulaBlock formula={content.formula} displayMode />
          </div>
        )}
      </div>

      {/* Controls & Calculator */}
      <div className="lesson-controls">
        <SceneControls />
        <CalculatorPanel mode={content.calculatorMode} />
      </div>
    </div>
  );
}

function SceneControls() {
  const {
    satellites,
    toggleSatellite,
    showSpheres,
    setShowSpheres,
    showSignalLines,
    setShowSignalLines,
    showOrbitPaths,
    setShowOrbitPaths,
  } = useGPSStore();

  return (
    <div className="scene-controls">
      <div className="control-section-title">3D 場景控制</div>
      <div className="toggle-row">
        <label>
          <input type="checkbox" checked={showSpheres} onChange={(e) => setShowSpheres(e.target.checked)} />
          顯示偽距球面
        </label>
        <label>
          <input type="checkbox" checked={showSignalLines} onChange={(e) => setShowSignalLines(e.target.checked)} />
          訊號線
        </label>
        <label>
          <input type="checkbox" checked={showOrbitPaths} onChange={(e) => setShowOrbitPaths(e.target.checked)} />
          軌道路徑
        </label>
      </div>
      <div className="sat-toggles">
        <div className="control-section-title">衛星開關</div>
        {satellites.map((sat) => (
          <button
            key={sat.id}
            className={`sat-btn ${sat.visible ? 'active' : ''}`}
            style={sat.visible ? { borderColor: sat.color, color: sat.color } : {}}
            onClick={() => toggleSatellite(sat.id)}
          >
            🛰️ {sat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface CalculatorPanelProps {
  mode: string;
}

function CalculatorPanel({ mode }: CalculatorPanelProps) {
  const store = useGPSStore();

  if (mode === 'overview') {
    return (
      <div className="calculator-panel">
        <div className="calc-title">系統概述</div>
        <ValueInspector
          items={[
            { label: '可見衛星數', value: store.satellites.filter((s) => s.visible).length, unit: '顆' },
            { label: 'GPS 軌道高度', value: '約 20,200', unit: 'km' },
            { label: '訊號頻率 L1', value: '1575.42', unit: 'MHz' },
            { label: '光速 c', value: '299,792,458', unit: 'm/s' },
            { label: '典型精度', value: '3–5', unit: 'm (CEP)' },
          ]}
        />
      </div>
    );
  }

  if (mode === 'pseudorange') {
    const timeDiffS = store.timeDiffMs / 1000;
    const pr = timeDiffToPseudorange(timeDiffS);
    return (
      <div className="calculator-panel">
        <div className="calc-title">偽距計算</div>
        <div className="slider-row">
          <label>時間差 Δt：{store.timeDiffMs.toFixed(1)} ms</label>
          <input
            type="range"
            min={1}
            max={200}
            step={0.1}
            value={store.timeDiffMs}
            onChange={(e) => store.setTimeDiffMs(parseFloat(e.target.value))}
          />
        </div>
        <ValueInspector
          items={[
            { label: 'Δt', value: `${store.timeDiffMs.toFixed(1)} ms = ${timeDiffS.toFixed(6)} s` },
            { label: 'c', value: `${C.toLocaleString()} m/s` },
            { label: "ρ' = c × Δt", value: (pr / 1000).toFixed(1), unit: 'km', color: '#22d3ee' },
            { label: '偽距', value: pr.toFixed(0), unit: 'm', color: '#22d3ee' },
          ]}
        />
        <div className="calc-note">
          GPS 衛星軌道高度約 20,200 km，訊號傳播時間約 67 ms。
        </div>
      </div>
    );
  }

  if (mode === 'clockbias') {
    const biasS = store.clockBiasNs * 1e-9;
    const biasM = biasS * C;
    return (
      <div className="calculator-panel">
        <div className="calc-title">時鐘偏差影響</div>
        <div className="slider-row">
          <label>時鐘偏差：{store.clockBiasNs.toFixed(0)} ns</label>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={store.clockBiasNs}
            onChange={(e) => store.setClockBiasNs(parseFloat(e.target.value))}
          />
        </div>
        <ValueInspector
          items={[
            { label: '時鐘偏差', value: `${store.clockBiasNs.toFixed(0)} ns` },
            { label: '偏差時間', value: `${biasS.toExponential(2)} s` },
            {
              label: '距離誤差 B = c × 偏差',
              value: biasM.toFixed(2),
              unit: 'm',
              color: biasM > 0 ? '#f87171' : biasM < 0 ? '#a78bfa' : '#4ade80',
            },
          ]}
        />
        <div className="calc-note">
          1 奈秒的時間誤差 = 約 30 公分的距離誤差！
        </div>
        <div className="slider-row">
          <label>測量雜訊：{store.noiseMeters.toFixed(0)} m</label>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={store.noiseMeters}
            onChange={(e) => store.setNoiseMeters(parseFloat(e.target.value))}
          />
        </div>
      </div>
    );
  }

  if (mode === 'leastsquares') {
    const visibleSats = store.satellites.filter((s) => s.visible);
    const hMatrix =
      store.iterationSteps.length > 0
        ? buildHMatrix(
            visibleSats.map((s) => ({
              position: s.position,
              pseudorange: 0,
            })),
            store.trueReceiverPos
          )
        : [];

    return (
      <div className="calculator-panel">
        <div className="calc-title">最小平方法</div>
        <div className="slider-row">
          <label>測量雜訊：{store.noiseMeters.toFixed(0)} m</label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={store.noiseMeters}
            onChange={(e) => store.setNoiseMeters(parseFloat(e.target.value))}
          />
        </div>
        <button className="run-btn" onClick={store.runLeastSquares} disabled={visibleSats.length < 4}>
          {visibleSats.length < 4
            ? `需要至少 4 顆衛星（目前 ${visibleSats.length} 顆）`
            : '▶ 執行最小平方法'}
        </button>

        {store.iterationSteps.length > 0 && (
          <>
            <div className="slider-row" style={{ marginTop: 8 }}>
              <label>
                顯示第 {store.currentIteration + 1} 次迭代（共 {store.iterationSteps.length} 次）
              </label>
              <input
                type="range"
                min={0}
                max={store.iterationSteps.length - 1}
                step={1}
                value={store.currentIteration}
                onChange={(e) => store.setCurrentIteration(parseInt(e.target.value))}
              />
            </div>
            <IterationTable
              steps={store.iterationSteps}
              highlightRow={store.currentIteration}
              onSelectRow={store.setCurrentIteration}
            />
            {hMatrix.length > 0 && (
              <MatrixTable
                matrix={hMatrix}
                title="H 矩陣（設計矩陣）"
                colLabels={['∂/∂x', '∂/∂y', '∂/∂z', '1']}
                rowLabels={visibleSats.map((s) => s.label)}
              />
            )}
          </>
        )}
      </div>
    );
  }

  if (mode === 'ecef') {
    const [x, y, z] = store.trueReceiverPos;
    const geo = ecefToGeodetic(x, y, z);
    const estimated = store.estimatedPos ? ecefToGeodetic(...store.estimatedPos) : null;
    return (
      <div className="calculator-panel">
        <div className="calc-title">ECEF → 地理座標</div>
        <div className="calc-section-label">真實接收器位置</div>
        <ValueInspector
          items={[
            { label: 'X (ECEF)', value: x.toFixed(1), unit: 'km' },
            { label: 'Y (ECEF)', value: y.toFixed(1), unit: 'km' },
            { label: 'Z (ECEF)', value: z.toFixed(1), unit: 'km' },
            { label: '緯度 φ', value: geo.lat.toFixed(4), unit: '°', color: '#4ade80' },
            { label: '經度 λ', value: geo.lon.toFixed(4), unit: '°', color: '#4ade80' },
            { label: '高度 h', value: geo.alt.toFixed(1), unit: 'km', color: '#4ade80' },
          ]}
        />
        {estimated && (
          <>
            <div className="calc-section-label" style={{ marginTop: 12 }}>估計位置</div>
            <ValueInspector
              items={[
                { label: '緯度 φ（估計）', value: estimated.lat.toFixed(4), unit: '°', color: '#fbbf24' },
                { label: '經度 λ（估計）', value: estimated.lon.toFixed(4), unit: '°', color: '#fbbf24' },
                { label: '高度 h（估計）', value: estimated.alt.toFixed(1), unit: 'km', color: '#fbbf24' },
              ]}
            />
          </>
        )}
        {!estimated && (
          <div className="calc-note">請先在第 6 章執行最小平方法，再回到此章查看估計座標。</div>
        )}
      </div>
    );
  }

  if (mode === 'error') {
    return (
      <div className="calculator-panel">
        <div className="calc-title">誤差模擬</div>
        <div className="slider-row">
          <label>測量雜訊：{store.noiseMeters.toFixed(0)} m</label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={store.noiseMeters}
            onChange={(e) => store.setNoiseMeters(parseFloat(e.target.value))}
          />
        </div>
        <div className="slider-row">
          <label>時鐘偏差：{store.clockBiasNs.toFixed(0)} ns</label>
          <input
            type="range"
            min={-100}
            max={100}
            step={5}
            value={store.clockBiasNs}
            onChange={(e) => store.setClockBiasNs(parseFloat(e.target.value))}
          />
        </div>
        <ValueInspector
          items={[
            { label: '雜訊誤差', value: store.noiseMeters.toFixed(0), unit: 'm', color: store.noiseMeters > 20 ? '#f87171' : '#4ade80' },
            { label: '時鐘距離誤差', value: (store.clockBiasNs * 1e-9 * C).toFixed(1), unit: 'm', color: '#fbbf24' },
            { label: '可見衛星數', value: store.satellites.filter((s) => s.visible).length, unit: '顆' },
          ]}
        />
        <button className="run-btn" onClick={store.runLeastSquares} disabled={store.satellites.filter(s => s.visible).length < 4}>
          ▶ 執行定位（含誤差）
        </button>
        {store.estimatedPos && (
          <div className="calc-note" style={{ color: '#4ade80' }}>
            定位完成！在第 8 章查看地理座標結果。
          </div>
        )}
      </div>
    );
  }

  return null;
}

function markdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
