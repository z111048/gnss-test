export interface LessonMeta {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

export const LESSONS: LessonMeta[] = [
  { id: 1, title: 'GPS 系統總覽', subtitle: '衛星、控制站、接收器', icon: '🛰️' },
  { id: 2, title: '訊號如何變成距離', subtitle: '偽距與光速', icon: '📡' },
  { id: 3, title: '一顆衛星的球面', subtitle: '偽距形成球面', icon: '⚪' },
  { id: 4, title: '三顆衛星的交會', subtitle: '縮小候選位置', icon: '🔵' },
  { id: 5, title: '接收器時鐘偏差', subtitle: '為什麼需要第四顆衛星', icon: '⏱️' },
  { id: 6, title: '最小平方法定位', subtitle: '迭代收斂估計位置', icon: '📐' },
  { id: 7, title: '誤差來源', subtitle: '電離層、多路徑、DOP', icon: '⚠️' },
  { id: 8, title: '經緯度轉換', subtitle: 'ECEF → 地理座標', icon: '🗺️' },
];

export interface LessonContent {
  id: number;
  description: string[];
  formula?: string;
  sceneHints: {
    showSpheres?: boolean;
    showSignalLines?: boolean;
    showOrbitPaths?: boolean;
    showResiduals?: boolean;
    activeSatCount?: number;
  };
  calculatorMode: 'pseudorange' | 'clockbias' | 'leastsquares' | 'ecef' | 'overview' | 'error';
}

export const LESSON_CONTENTS: LessonContent[] = [
  {
    id: 1,
    description: [
      'GPS（全球定位系統）由三個部分組成：',
      '🛰️ **太空段（Space Segment）**：至少 24 顆 GPS 衛星，在距地面約 20,200 km 的中地球軌道運行。',
      '🏢 **控制段（Control Segment）**：全球地面控制站，負責監測並修正衛星的時鐘與軌道。',
      '📱 **使用者段（User Segment）**：GPS 接收器，包括手機、導航設備、測量儀器等。',
      '右側 3D 畫面顯示模擬衛星的分佈。你可以拖曳旋轉場景！',
    ],
    sceneHints: { showSignalLines: true, showOrbitPaths: true, activeSatCount: 4 },
    calculatorMode: 'overview',
  },
  {
    id: 2,
    description: [
      '衛星不斷播放帶有**精確時間戳記**的無線電訊號。',
      '當接收器收到訊號時，計算：',
      '**時間差 Δt** = 接收時間 - 衛星發射時間',
      '再乘以光速 c ≈ 299,792,458 m/s，就得到**偽距（Pseudorange）**：',
      '調整下方的時間差滑桿，觀察偽距的變化。',
    ],
    formula: "\\rho' = c \\cdot \\Delta t",
    sceneHints: { showSignalLines: true, activeSatCount: 1 },
    calculatorMode: 'pseudorange',
  },
  {
    id: 3,
    description: [
      '已知偽距 ρ 和衛星位置 (x_i, y_i, z_i)，接收器可以畫出一個**以衛星為球心、偽距為半徑的球面**。',
      '接收器的位置就在這個球面上的某一點。',
      '**一顆衛星**：位置有無限多可能（整個球面）',
      '開啟「顯示球面」按鈕，觀察透明球體。',
    ],
    formula:
      '\\sqrt{(x-x_i)^2+(y-y_i)^2+(z-z_i)^2} = \\rho_i',
    sceneHints: { showSpheres: true, showSignalLines: true, activeSatCount: 1 },
    calculatorMode: 'pseudorange',
  },
  {
    id: 4,
    description: [
      '增加更多衛星，各自形成一個球面。',
      '**兩顆衛星**：球面相交成一個圓',
      '**三顆衛星**：球面交會在兩個候選點（通常一個在地球外，可排除）',
      '但三顆衛星假設接收器時鐘是完美的——實際上不是！',
      '開關衛星按鈕，觀察球面如何逐步縮小候選位置。',
    ],
    sceneHints: { showSpheres: true, showSignalLines: true, activeSatCount: 3 },
    calculatorMode: 'pseudorange',
  },
  {
    id: 5,
    description: [
      'GPS 衛星使用高精度原子鐘，但**接收器時鐘**便宜且不精確。',
      '接收器時鐘偏差 B 會讓所有偽距同時增大或縮小：',
      '這等於要解四個未知數：x, y, z, **B**',
      '因此需要**至少四顆衛星**才能同時求出位置和時鐘偏差！',
      '調整下方的時鐘偏差滑桿，觀察所有球面同時膨脹/收縮。',
    ],
    formula:
      "\\rho'_i = \\sqrt{(x-x_i)^2+(y-y_i)^2+(z-z_i)^2} + B",
    sceneHints: { showSpheres: true, showSignalLines: true, activeSatCount: 4 },
    calculatorMode: 'clockbias',
  },
  {
    id: 6,
    description: [
      '有了四顆以上的衛星，可以用**最小平方法（Least Squares）**反覆迭代，找到最佳位置。',
      '**步驟**：',
      '1. 從初始猜測位置出發（如地球中心）',
      '2. 計算預測偽距與觀測偽距的差（殘差）',
      '3. 建立 H 矩陣（偏微分）',
      '4. 求解修正量 Δ = (H^T H)^{-1} H^T v',
      '5. 更新位置，重複直到收斂',
      '點擊「執行最小平方法」，觀察 3D 畫面中估計點逐步逼近真實位置。',
    ],
    formula:
      '\\Delta = (H^T H)^{-1} H^T \\mathbf{v}',
    sceneHints: { showSignalLines: true, showResiduals: true, activeSatCount: 4 },
    calculatorMode: 'leastsquares',
  },
  {
    id: 7,
    description: [
      'GPS 定位存在多種誤差來源：',
      '🌐 **電離層延遲**：電離層中自由電子讓訊號減速，造成 1–30m 誤差',
      '💨 **對流層延遲**：大氣水蒸氣影響，低仰角衛星誤差更大',
      '🏢 **多路徑效應**：訊號反射建築物後進入接收器，城市峽谷最嚴重',
      '📐 **衛星幾何分佈（DOP）**：衛星過於集中時，定位精度下降',
      '調整下方「雜訊」滑桿，觀察誤差對定位結果的影響。',
    ],
    sceneHints: { showSignalLines: true, activeSatCount: 4 },
    calculatorMode: 'error',
  },
  {
    id: 8,
    description: [
      '最小平方法求出的是 **ECEF 座標**（地心地固座標系），以地球中心為原點。',
      '要轉成我們熟悉的**經緯度和高度**，需要數學轉換：',
      '**經度 λ** = atan2(Y, X)',
      '**緯度 φ** 用迭代法求解（Bowring\'s method）',
      '**高度 h** = 橢球面距離',
      '下方計算面板顯示從 ECEF 到地理座標的完整換算過程。',
    ],
    formula: '\\lambda = \\text{atan2}(Y, X)',
    sceneHints: { showSignalLines: true, activeSatCount: 4 },
    calculatorMode: 'ecef',
  },
];
