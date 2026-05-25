import { create } from 'zustand';
import type { SatelliteData, IterationStep } from '../features/gps-calculation/types';
import { DEMO_SATELLITES, TRUE_RECEIVER_POSITION } from '../data/demoSatellites';
import { generatePseudorange } from '../features/gps-calculation/pseudorange';
import { solveLeastSquares } from '../features/gps-calculation/leastSquares';

interface GPSStore {
  // Lesson navigation
  currentLesson: number;
  setLesson: (n: number) => void;

  // Satellites
  satellites: SatelliteData[];
  toggleSatellite: (id: number) => void;

  // Scene controls
  showSpheres: boolean;
  setShowSpheres: (v: boolean) => void;
  showSignalLines: boolean;
  setShowSignalLines: (v: boolean) => void;
  showOrbitPaths: boolean;
  setShowOrbitPaths: (v: boolean) => void;
  showResiduals: boolean;
  setShowResiduals: (v: boolean) => void;

  // Pseudorange demo
  timeDiffMs: number; // milliseconds
  setTimeDiffMs: (v: number) => void;

  // Clock bias demo
  clockBiasNs: number; // nanoseconds
  setClockBiasNs: (v: number) => void;

  // Noise
  noiseMeters: number;
  setNoiseMeters: (v: number) => void;

  // Receiver
  trueReceiverPos: [number, number, number]; // km
  estimatedPos: [number, number, number] | null; // km

  // Least squares
  iterationSteps: IterationStep[];
  currentIteration: number;
  setCurrentIteration: (n: number) => void;
  runLeastSquares: () => void;

  // Computed
  pseudoranges: { satelliteId: number; pseudorange: number }[];
  recomputePseudoranges: () => void;
}

export const useGPSStore = create<GPSStore>((set, get) => ({
  currentLesson: 1,
  setLesson: (n) => set({ currentLesson: n }),

  satellites: DEMO_SATELLITES,
  toggleSatellite: (id) =>
    set((state) => ({
      satellites: state.satellites.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
    })),

  showSpheres: false,
  setShowSpheres: (v) => set({ showSpheres: v }),
  showSignalLines: true,
  setShowSignalLines: (v) => set({ showSignalLines: v }),
  showOrbitPaths: false,
  setShowOrbitPaths: (v) => set({ showOrbitPaths: v }),
  showResiduals: false,
  setShowResiduals: (v) => set({ showResiduals: v }),

  timeDiffMs: 67,
  setTimeDiffMs: (v) => set({ timeDiffMs: v }),

  clockBiasNs: 0,
  setClockBiasNs: (v) => set({ clockBiasNs: v }),

  noiseMeters: 0,
  setNoiseMeters: (v) => set({ noiseMeters: v }),

  trueReceiverPos: TRUE_RECEIVER_POSITION,
  estimatedPos: null,

  iterationSteps: [],
  currentIteration: 0,
  setCurrentIteration: (n) => set({ currentIteration: n }),

  pseudoranges: [],
  recomputePseudoranges: () => {
    const { satellites, trueReceiverPos, clockBiasNs, noiseMeters } = get();
    const clockBiasS = clockBiasNs * 1e-9;
    const visible = satellites.filter((s) => s.visible);
    const pseudoranges = visible.map((s) => ({
      satelliteId: s.id,
      pseudorange: generatePseudorange(
        s.position,
        trueReceiverPos,
        clockBiasS,
        noiseMeters
      ),
    }));
    set({ pseudoranges });
  },

  runLeastSquares: () => {
    const { satellites, trueReceiverPos, clockBiasNs, noiseMeters } = get();
    const clockBiasS = clockBiasNs * 1e-9;
    const visible = satellites.filter((s) => s.visible);
    if (visible.length < 4) return;

    const satsWithPr = visible.map((s) => ({
      position: s.position,
      pseudorange: generatePseudorange(
        s.position,
        trueReceiverPos,
        clockBiasS,
        noiseMeters
      ),
    }));

    const steps = solveLeastSquares(satsWithPr, [0, 0, 0]);
    const last = steps[steps.length - 1];
    set({
      iterationSteps: steps,
      currentIteration: 0,
      estimatedPos: [last.x, last.y, last.z],
    });
  },
}));
