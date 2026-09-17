export type PlotStatus = 'available' | 'reserved' | 'booked';

export interface Plot {
  id: string;
  label: string;
  status: PlotStatus;
  sizeSqft: number;
  widthFt: number;
  depthFt: number;
  facing: 'East' | 'North' | 'West' | 'South';
  pricePerSqft: number;
  position: [number, number]; // x, z on the master plan grid
}

// Deterministic pseudo-random so SSR/CSR match
const seeded = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const SIZES = [600, 800, 1000, 1200, 1500, 1800, 2400];

export const PLOTS: Plot[] = Array.from({ length: 32 }, (_, i) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  const size = SIZES[Math.floor(seeded(i) * SIZES.length)];
  const r = seeded(i + 100);
  const status: PlotStatus = r < 0.3 ? 'booked' : r < 0.45 ? 'reserved' : 'available';

  return {
    id: `plot-${i + 1}`,
    label: `${String.fromCharCode(65 + row)}-${col + 1}`,
    status,
    sizeSqft: size,
    widthFt: Math.round(Math.sqrt(size) * 10) / 10,
    depthFt: Math.round(size / Math.sqrt(size) * 10) / 10,
    facing: row % 2 === 0 ? 'East' : 'North',
    pricePerSqft: size >= 1500 ? 1400 : size >= 1000 ? 1800 : 2400,
    // 4-unit grid cells with a 2-unit road after the 4th column
    position: [col * 4 + (col >= 4 ? 2.5 : 0) - 15, row * 5 - 7.5],
  };
});

export const STATUS_COLORS: Record<PlotStatus, string> = {
  available: '#22c55e',
  reserved: '#eab308',
  booked: '#ef4444',
};

export const inr = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : `₹${n.toLocaleString('en-IN')}`;
