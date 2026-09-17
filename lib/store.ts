import { create } from 'zustand';

export type FloorMaterial = 'wood' | 'marble' | 'tile';

interface SiteState {
  isNight: boolean;
  toggleDayNight: () => void;
  activeProject: string | null;
  setActiveProject: (id: string | null) => void;
  selectedPlotId: string | null;
  selectPlot: (id: string | null) => void;
  floorMaterial: FloorMaterial;
  setFloorMaterial: (m: FloorMaterial) => void;
  wallColor: string;
  setWallColor: (c: string) => void;
}

export const useSiteStore = create<SiteState>()((set) => ({
  isNight: false,
  toggleDayNight: () => set((s) => ({ isNight: !s.isNight })),
  activeProject: null,
  setActiveProject: (id) => set({ activeProject: id }),
  selectedPlotId: null,
  selectPlot: (id) => set({ selectedPlotId: id }),
  floorMaterial: 'wood',
  setFloorMaterial: (floorMaterial) => set({ floorMaterial }),
  wallColor: '#f5f0e6',
  setWallColor: (wallColor) => set({ wallColor }),
}));
