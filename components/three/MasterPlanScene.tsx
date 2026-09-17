'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Edges } from '@react-three/drei';
import { useRef, useState } from 'react';
import { PLOTS, STATUS_COLORS, inr, type Plot } from '@/lib/data/plots';
import { useSiteStore } from '@/lib/store';
import { X, CheckCircle2, Clock, Ban, Compass, Maximize2, ArrowRight } from 'lucide-react';

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

  useFrame((_, dt) => {
    const target = hovered || selected ? 0.65 : 0.15;
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
  const { selectedPlotId, selectPlot } = useSiteStore();
  const plot = PLOTS.find((p) => p.id === selectedPlotId);

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
      </div>

      {/* Selected plot detail panel */}
      {plot && (
        <div className="absolute bottom-4 right-4 w-80 rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button onClick={() => selectPlot(null)} className="absolute right-3.5 top-3.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600">
            <Compass className="h-3.5 w-3.5" />
            <span>Plot {plot.label} · Padmavathi Nagar</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">
            <div>
              <span className="text-xs text-slate-400 block">Area</span>
              <b className="text-slate-900">{plot.sizeSqft} sq.ft</b>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Dimensions</span>
              <b className="text-slate-900">{plot.widthFt}′ × {plot.depthFt}′</b>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Facing</span>
              <b className="text-slate-900">{plot.facing}</b>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Rate</span>
              <b className="text-slate-900">₹{plot.pricePerSqft}/sq.ft</b>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Total Investment</span>
              <span className="text-xl font-bold text-emerald-700">{inr(plot.sizeSqft * plot.pricePerSqft)}</span>
            </div>
            <a href="#contact" className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600 hover:shadow-lg">
              <span>Reserve</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
