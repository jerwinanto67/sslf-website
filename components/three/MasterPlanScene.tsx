'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Edges } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import { PLOTS, STATUS_COLORS, inr, type Plot } from '@/lib/data/plots';
import { useSiteStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/i18n';
import { X, CheckCircle2, Clock, Ban, Compass, Maximize2, ArrowRight, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

/* ---------- Animated Scanning Radar / Survey Beam ---------- */
function RadarSweep() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const z = Math.sin(clock.elapsedTime * 0.8) * 20;
      meshRef.current.position.z = z;
    }
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position={[0, 0.08, 0]}>
      <planeGeometry args={[45, 0.4]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ---------- 3D Compass Indicator ---------- */
function CompassRose() {
  const ringRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={[-18, 0.2, -18]}>
      <group ref={ringRef}>
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.6, 1.8, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* North pointer needle */}
      <mesh position={[0, 0.05, -0.9]} rotation-x={-Math.PI / 2}>
        <coneGeometry args={[0.35, 0.9, 3]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0.9]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.35, 0.9, 3]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

function PlotMesh({ plot }: { plot: Plot }) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const selected = useSiteStore((s) => s.selectedPlotId === plot.id);
  const selectPlot = useSiteStore((s) => s.selectPlot);
  const facingFilter = useSiteStore((s) => s.facingFilter);

  const matchesFilter = facingFilter === 'All' || plot.facing === facingFilter;

  useFrame((_, dt) => {
    const target = hovered || selected ? 0.65 : matchesFilter ? 0.15 : 0.05;
    if (ref.current) {
      ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, target, 10, dt);
    }
  });

  const interactive = plot.status === 'available';

  return (
    <group position={[plot.position[0], 0, plot.position[1]]}>
      <mesh ref={ref} position-y={0.15}
        onClick={(e) => { e.stopPropagation(); if (interactive) selectPlot(selected ? null : plot.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (interactive) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}>
        <boxGeometry args={[3.2, 0.3, 4]} />
        <meshStandardMaterial
          color={STATUS_COLORS[plot.status]}
          opacity={matchesFilter ? 1 : 0.25}
          transparent={!matchesFilter}
          emissive={hovered && interactive ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered && interactive ? 0.35 : 0.05}
          roughness={0.55} />
        {selected && <Edges linewidth={3} threshold={15} color="#38bdf8" />}
        {hovered && !selected && <Edges linewidth={2} threshold={15} color="#ffffff" />}
      </mesh>

      {hovered && (
        <Html position={[0, 1.6, 0]} center distanceFactor={26} style={{ pointerEvents: 'none' }}>
          <div className="w-44 rounded-xl border border-white/20 bg-slate-950/95 p-3 text-xs text-white shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
              <span className="font-bold text-amber-400">Plot {plot.label}</span>
              <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${plot.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : plot.status === 'reserved' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                {plot.status === 'available' ? <CheckCircle2 className="h-2.5 w-2.5" /> : plot.status === 'reserved' ? <Clock className="h-2.5 w-2.5" /> : <Ban className="h-2.5 w-2.5" />}
                {plot.status}
              </span>
            </div>
            <p className="text-slate-300">{plot.sizeSqft} sq.ft · {plot.widthFt}′ × {plot.depthFt}′</p>
            <p className="text-slate-400">{plot.facing} facing</p>
            <p className="mt-1.5 font-bold text-emerald-400 text-sm">{inr(plot.sizeSqft * plot.pricePerSqft)}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function MasterPlanScene() {
  const { selectedPlotId, selectPlot, language, facingFilter, setFacingFilter } = useSiteStore();
  const t = TRANSLATIONS[language];
  const plot = PLOTS.find((p) => p.id === selectedPlotId);

  // EMI Calculator State
  const [showEmi, setShowEmi] = useState(false);
  const [tenureYears, setTenureYears] = useState(15);
  const interestRate = 8.5; // 8.5% annual interest

  const emiCalculation = useMemo(() => {
    if (!plot) return { emi: 0, loanAmount: 0, downPayment: 0 };
    const totalPrice = plot.sizeSqft * plot.pricePerSqft;
    const downPayment = Math.round(totalPrice * 0.2); // 20% down payment
    const loanAmount = totalPrice - downPayment; // 80% loan
    const monthlyRate = interestRate / 12 / 100;
    const months = tenureYears * 12;
    const emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
    return { emi, loanAmount, downPayment };
  }, [plot, tenureYears]);

  return (
    <div className="relative h-[80vh] w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
      <Canvas shadows camera={{ position: [0, 34, 26], fov: 42 }}
        onPointerMissed={() => selectPlot(null)}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[15, 30, 10]} intensity={1.2} castShadow />
        {/* base terrain */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[70, 50]} />
          <meshStandardMaterial color="#14532d" roughness={1} />
        </mesh>
        {/* central road */}
        <mesh rotation-x={-Math.PI / 2} position={[1.25, 0, 0]}>
          <planeGeometry args={[2.5, 46]} />
          <meshStandardMaterial color="#3f3f46" />
        </mesh>

        {/* Animated survey scanning laser */}
        <RadarSweep />

        {/* 3D animated compass */}
        <CompassRose />

        {PLOTS.map((p) => <PlotMesh key={p.id} plot={p} />)}
        <OrbitControls makeDefault enablePan={false} minDistance={18} maxDistance={55}
          maxPolarAngle={Math.PI / 3} target={[0, 0, 0]} />
      </Canvas>

      {/* Legend with modern vector badges */}
      <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-white backdrop-blur shadow-xl">
        <p className="mb-2.5 font-bold uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
          <Maximize2 className="h-3.5 w-3.5" />
          Padmavathi Nagar — Master Plan
        </p>
        {(Object.keys(STATUS_COLORS) as (keyof typeof STATUS_COLORS)[]).map((s) => (
          <div key={s} className="mt-1.5 flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s] }} />
            <span className="capitalize">{s}</span>
          </div>
        ))}

        {/* Interactive Vastu Facing Filter */}
        <div className="mt-3.5 pt-3 border-t border-white/10">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Filter by Facing</span>
          <div className="flex gap-1.5">
            {(['All', 'East', 'North'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFacingFilter(f)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${facingFilter === f ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected plot detail panel with Interactive EMI Calculator */}
      {plot && (
        <div className="absolute bottom-4 right-4 w-84 max-h-[72vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button onClick={() => selectPlot(null)} className="absolute right-3.5 top-3.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600">
            <Compass className="h-3.5 w-3.5" />
            <span>Plot {plot.label} · Padmavathi Nagar</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 block">Area</span>
              <b className="text-slate-900 text-sm">{plot.sizeSqft} sq.ft</b>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Dimensions</span>
              <b className="text-slate-900 text-sm">{plot.widthFt}′ × {plot.depthFt}′</b>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Facing</span>
              <b className="text-slate-900">{plot.facing}</b>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Rate</span>
              <b className="text-slate-900">₹{plot.pricePerSqft}/sq.ft</b>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Investment</span>
              <span className="text-lg font-bold text-emerald-700">{inr(plot.sizeSqft * plot.pricePerSqft)}</span>
            </div>
            <button
              onClick={() => setShowEmi(!showEmi)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg transition"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>EMI</span>
              {showEmi ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Collapsible Interactive EMI Widget */}
          {showEmi && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-slate-700 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-800">Tenure: {tenureYears} Years</span>
                <span className="text-emerald-700 font-bold text-sm">₹{emiCalculation.emi.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex gap-1 mb-2">
                {[5, 10, 15, 20].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setTenureYears(yr)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition ${tenureYears === yr ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    {yr}Y
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Loan (80%): {inr(emiCalculation.loanAmount)}</span>
                <span>Rate: 8.5% p.a.</span>
              </div>
            </div>
          )}

          <a href="#contact" className="mt-3.5 flex items-center justify-center gap-1.5 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-600">
            <span>{t.reservePlot}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
