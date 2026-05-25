# 🛰️ GPS 定位原理互動教案

**互動式學習網站**，讓使用者從「衛星發出訊號」一路操作到「接收器算出自己的經緯度與高度」，並看見每一步的數學中間值。

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r158-black?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-41%20passing-brightgreen?style=flat-square)

---

## ✨ 功能特色

| 章節 | 內容 | 互動方式 |
|------|------|----------|
| 1 系統總覽 | 太空段、控制段、使用者段 | 3D 旋轉地球與衛星 |
| 2 偽距計算 | ρ = c × Δt | 時間差滑桿即時更新 |
| 3 球面交會 | 一顆衛星 = 一個球面 | 開關透明球面 |
| 4 多顆交會 | 三個球面縮小候選位置 | 逐步開啟衛星 |
| 5 時鐘偏差 | 為什麼需要第四顆衛星 | ±50 ns 滑桿，所有球面同步膨脹 |
| 6 最小平方法 | 迭代收斂估計位置 | H 矩陣、迭代表格、3D 動畫 |
| 7 誤差來源 | 電離層、多路徑、DOP | 雜訊滑桿 |
| 8 座標轉換 | ECEF → 緯度/經度/高度 | 即時換算顯示 |

---

## 🚀 快速開始

### 需求

- Node.js 18+
- npm 9+

### 安裝與執行

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器前往 http://localhost:5173

### 其他指令

```bash
# 執行測試
npm test

# 執行測試（監視模式）
npm run test:watch

# 測試覆蓋率報告
npm run test:coverage

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

---

## 🏗️ 技術架構

```
React + TypeScript + Vite
├── Three.js / React Three Fiber  → 3D 場景（地球、衛星、球面、訊號線）
├── KaTeX                         → 數學公式渲染
├── Zustand                       → 全域狀態管理
└── Vitest                        → 單元測試
```

### 目錄結構

```
src/
├── app/
│   └── App.tsx                   # 主要 layout（Header + Sidebar + 3D + Panel）
├── features/
│   ├── lesson/
│   │   ├── LessonPage.tsx        # 右側教學內容 + 計算面板
│   │   ├── LessonStepper.tsx     # 左側章節導覽
│   │   └── lessonContent.ts      # 8 章教學文字與場景配置
│   ├── gps-calculation/
│   │   ├── pseudorange.ts        # 偽距計算（ρ = c × Δt）
│   │   ├── ecef.ts               # ECEF ↔ 地理座標轉換
│   │   ├── leastSquares.ts       # 最小平方法迭代求解
│   │   └── types.ts              # 共用型別定義
│   ├── scene3d/
│   │   ├── GPSScene.tsx          # Canvas 場景根元件
│   │   ├── Earth.tsx             # 地球（慢速自轉）
│   │   ├── Satellite.tsx         # 衛星模型 + 標籤
│   │   ├── SignalSphere.tsx      # 偽距透明球面
│   │   ├── Receiver.tsx          # 接收器（真實/估計）
│   │   └── ResidualVector.tsx    # 訊號線 + 殘差向量
│   └── calculator-panel/
│       ├── FormulaBlock.tsx      # KaTeX 公式渲染
│       ├── MatrixTable.tsx       # H 矩陣顯示
│       ├── IterationTable.tsx    # 迭代步驟表格
│       └── ValueInspector.tsx    # 數值面板
├── data/
│   └── demoSatellites.ts         # 6 顆模擬衛星（GPS MEO 軌道）
├── store/
│   └── gpsStore.ts               # Zustand 全域狀態
└── utils/
    ├── units.ts                  # 物理常數與單位換算
    └── formatNumber.ts           # 數字格式化工具
```

---

## 🧮 核心數學

### 偽距方程

```
ρ'_i = c × Δt = √((x-xᵢ)² + (y-yᵢ)² + (z-zᵢ)²) + B
```

- `ρ'_i`：第 i 顆衛星的偽距
- `c`：光速（299,792,458 m/s）
- `(xᵢ, yᵢ, zᵢ)`：衛星 ECEF 座標
- `(x, y, z)`：接收器 ECEF 座標（未知）
- `B`：接收器時鐘偏差換算距離（未知）

### 最小平方法

```
Δ = (HᵀH)⁻¹ Hᵀ v
```

| 符號 | 說明 |
|------|------|
| `H` | 設計矩陣（偏微分，每衛星一行） |
| `v` | 殘差向量（觀測偽距 − 預測偽距） |
| `Δ` | 狀態更新量 [Δx, Δy, Δz, ΔB] |

---

## 🧪 測試

共 **41 個單元測試**，涵蓋：

| 測試檔案 | 涵蓋內容 |
|---------|---------|
| `pseudorange.test.ts` | 偽距公式、距離計算、時鐘偏差影響 |
| `ecef.test.ts` | ECEF ↔ 地理座標雙向轉換 |
| `leastSquares.test.ts` | 最小平方法收斂、H 矩陣結構 |
| `units.test.ts` | 物理常數、單位換算、格式化 |

```
npm test
# Test Files  4 passed (4)
#      Tests  41 passed (41)
```

---

## 📐 畫面配置

```
┌──────────────────────────────────────────────────────────────┐
│  🛰️  GPS 定位原理互動教案                                     │
├────────────┬──────────────────────────┬───────────────────────┤
│ 章節導覽   │  3D 場景                  │  教學說明             │
│ 1 系統總覽 │  地球 + 衛星 + 球面        │  公式與說明文字       │
│ 2 偽距     │  訊號線 + 軌道路徑         ├───────────────────────┤
│ 3 球面     │                           │  場景控制             │
│ 4 交會     │  （可拖曳旋轉縮放）        │  衛星開關             │
│ 5 時鐘     │                           ├───────────────────────┤
│ 6 最小平方 │                           │  計算面板             │
│ 7 誤差     │                           │  滑桿 / 迭代表格      │
│ 8 座標     │                           │  H 矩陣              │
└────────────┴──────────────────────────┴───────────────────────┘
```

---

## 🔭 未來擴充方向

- [ ] 接入真實 GPS 星曆資料（RINEX 格式）
- [ ] CesiumJS 真實 3D 地球場景
- [ ] DOP（精度遞減因子）數值計算與顯示
- [ ] 多路徑效應動畫
- [ ] 響應式版面（行動裝置支援）
- [ ] 英文版

---

## 📚 參考資料

- [GPS.gov — Official U.S. Government GPS Website](https://www.gps.gov/)
- [ESA Navipedia — GNSS Basic Observables](https://gssc.esa.int/navipedia/index.php/GNSS_Basic_Observables)
- [Caltech GPS Basics — Observation Equations](https://web.gps.caltech.edu/classes/ge111/Docs/GPSbasics.pdf)
- [Penn State GEOG 862 — The Pseudorange Equation](https://courses.ems.psu.edu/geog862/node/1759)

---

## 📄 授權

MIT License
