import { create } from 'zustand';
import { type Language } from './i18n';

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
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  facingFilter: 'All' | 'East' | 'North';
  setFacingFilter: (facing: 'All' | 'East' | 'North') => void;
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
  language: 'en',
  toggleLanguage: () => set((s) => ({ language: s.language === 'en' ? 'ta' : 'en' })),
  setLanguage: (language) => set({ language }),
  facingFilter: 'All',
  setFacingFilter: (facingFilter) => set({ facingFilter }),
}));
