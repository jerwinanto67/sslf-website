'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Navigation, MapPin, Activity } from 'lucide-react';

const HUBS = [
  { id: 'hq', name: 'SSLF HQ — Ekkatuthangal', pos: [0, 0, 0] as const, color: '#f59e0b' },
  { id: 'oragadam', name: 'Oragadam Enclave', pos: [-16, 0, 6] as const, color: '#22c55e' },
  { id: 'uthukottai', name: 'Padmavathi Nagar, Uthukottai', pos: [-6, 0, -18] as const, color: '#22c55e' },
];

const LANDMARKS = [
  { name: 'Chennai Intl. Airport', dist: '12 km', pos: [14, 0, 4] as const },
  { name: 'Sriperumbudur Industrial Corridor', dist: '28 km', pos: [-22, 0, -6] as const },
  { name: 'GST Road / NH-45', dist: '6 km', pos: [8, 0, 12] as const },
  { name: 'Outer Ring Road', dist: '9 km', pos: [-10, 0, 14] as const },
];

function terrainHeight(x: number, z: number) {
  const d = Math.hypot(x, z);
  return Math.sin(x * 0.22) * Math.cos(z * 0.26) * 1.3 * Math.min(1, d / 14);
}

function Pulse({ position, color }: { position: readonly [number, number, number]; color: string }) {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ring1.current) {
      const p1 = (t % 1.6) / 1.6;
      ring1.current.scale.setScalar(0.6 + p1 * 2.5);
      (ring1.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - p1);
    }
    if (ring2.current) {
      const p2 = ((t + 0.8) % 1.6) / 1.6;
      ring2.current.scale.setScalar(0.6 + p2 * 2.5);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - p2);
    }
  });

  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y + 0.15, position[2]]}>
      <mesh ref={ring1} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/* ---------- Animated Traveling Light Pulse on Connectivity Corridor ---------- */
function CorridorPulse({ start, end, speed = 0.5, delay = 0 }: { start: [number, number, number]; end: [number, number, number]; speed?: number; delay?: number }) {
  const sphereRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!sphereRef.current) return;
    const progress = ((clock.elapsedTime * speed + delay) % 1);
    sphereRef.current.position.x = THREE.MathUtils.lerp(start[0], end[0], progress);
    sphereRef.current.position.y = THREE.MathUtils.lerp(start[1], end[1], progress);
    sphereRef.current.position.z = THREE.MathUtils.lerp(start[2], end[2], progress);
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.22, 12, 12]} />
      <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
    </mesh>
  );
}

export default function LocationMapScene() {
  const terrain = useMemo(() => {
    const geo = new THREE.PlaneGeometry(70, 70, 100, 100);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, terrainHeight(pos.getX(i), pos.getY(i)));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const hqY = terrainHeight(0, 0) + 0.5;

  return (
    <div className="relative h-[75vh] w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
      <Canvas camera={{ position: [0, 30, 34], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 10]} intensity={1.1} />
        <fog attach="fog" args={['#020617', 50, 100]} />

        <mesh geometry={terrain} rotation-x={-Math.PI / 2}>
          <meshStandardMaterial color="#123c2b" roughness={1} flatShading />
        </mesh>
        <gridHelper args={[70, 35, '#1e4d38', '#16382a']} position={[0, 0.05, 0]} />

        {HUBS.map((h) => (
          <group key={h.id}>
            <Pulse position={h.pos} color={h.color} />
            <Html position={[h.pos[0], terrainHeight(h.pos[0], h.pos[2]) + 2, h.pos[2]]} center distanceFactor={40} style={{ pointerEvents: 'none' }}>
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-400/40 bg-slate-950/85 px-3 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur">
                <MapPin className="h-3 w-3 text-amber-400" />
                <span>{h.name}</span>
              </div>
            </Html>
          </group>
        ))}

        {LANDMARKS.map((l, index) => {
          const ly = terrainHeight(l.pos[0], l.pos[2]);
          const startPt: [number, number, number] = [0, hqY, 0];
          const endPt: [number, number, number] = [l.pos[0], ly + 0.4, l.pos[2]];
          const linePoints: [number, number, number][] = [startPt, endPt];

          return (
            <group key={l.name}>
              <Line points={linePoints}
                color="#f59e0b" lineWidth={1.8} dashed dashSize={0.7} gapSize={0.4} transparent opacity={0.75} />
              {/* Traveling light pulse on the corridor */}
              <CorridorPulse start={startPt} end={endPt} speed={0.4} delay={index * 0.25} />

              <mesh position={[l.pos[0], ly + 0.3, l.pos[2]]}>
                <boxGeometry args={[0.55, 0.55, 0.55]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.6} />
              </mesh>
              <Html position={[l.pos[0], ly + 1.8, l.pos[2]]} center distanceFactor={40} style={{ pointerEvents: 'none' }}>
                <div className="flex items-center gap-1 whitespace-nowrap rounded-xl border border-slate-200/80 bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-800 shadow-md backdrop-blur">
                  <Navigation className="h-2.5 w-2.5 text-amber-600" />
                  <span>{l.name}</span>
                  <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.2 text-[9px] text-amber-800">{l.dist}</span>
                </div>
              </Html>
            </group>
          );
        })}

        <OrbitControls makeDefault enablePan={false} minDistance={20} maxDistance={60} maxPolarAngle={Math.PI / 2.4} />
      </Canvas>

      <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-white backdrop-blur shadow-xl">
        <p className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Chennai Connectivity Network
        </p>
        <p className="mt-1 text-slate-300">Live animated corridors = transit lines from SSLF HQ</p>
      </div>
    </div>
  );
}
