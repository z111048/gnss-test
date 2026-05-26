export interface SatelliteData {
  id: number;
  label: string;
  position: [number, number, number]; // ECEF in km
  clockBias: number; // seconds
  visible: boolean;
  color: string;
}

export interface ReceiverState {
  position: [number, number, number]; // ECEF in km
  clockBias: number; // seconds
  truePosition: [number, number, number]; // ECEF in km
}

export interface PseudorangeObservation {
  satelliteId: number;
  pseudorange: number; // meters
  noise: number; // meters of added noise
}

export interface IterationStep {
  iteration: number;
  x: number;
  y: number;
  z: number;
  B: number; // clock bias in meters
  residualNorm: number;
  delta?: [number, number, number, number]; // meters: [dx, dy, dz, dB]
  updatedState?: [number, number, number, number]; // km, km, km, meters
  observations?: IterationObservation[];
  hMatrix?: number[][];
  normalMatrix?: number[][];
  normalVector?: number[];
}

export interface IterationObservation {
  satelliteLabel: string;
  observedPseudorange: number;
  predictedPseudorange: number;
  residual: number;
  geometricDistance: number;
}

export interface LessonScene {
  activeSatelliteIds: number[];
  showSpheres: boolean;
  showResiduals: boolean;
  showOrbitPaths: boolean;
  showSignalLines: boolean;
  timeDiff: number; // seconds, for pseudorange demo
  clockBiasNs: number; // nanoseconds
}
