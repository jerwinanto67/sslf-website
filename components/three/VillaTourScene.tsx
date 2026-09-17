'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useSiteStore, type FloorMaterial } from '@/lib/store';
import { Eye, Layers, Palette, Compass, Move } from 'lucide-react';

const FLOORS: Record<FloorMaterial, { color: string; roughness: number; label: string }> = {
  wood:   { color: '#9a6b3f', roughness: 0.55, label: 'Teak Wood' },
  marble: { color: '#e9e7e2', roughness: 0.12, label: 'Italian Marble' },
  tile:   { color: '#b8b2a6', roughness: 0.4,  label: 'Vitrified Tile' },
};
const WALLS = ['#f5f0e6', '#dbeafe', '#dcfce7', '#fee2e2'];

/* WASD movement, clamped to room bounds */
function WalkControls() {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame(({ camera }, dt) => {
    const k = keys.current;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0; dir.normalize();
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
    const move = new THREE.Vector3();
    if (k['KeyW'] || k['ArrowUp']) move.add(dir);
    if (k['KeyS'] || k['ArrowDown']) move.sub(dir);
    if (k['KeyA'] || k['ArrowLeft']) move.sub(right);
    if (k['KeyD'] || k['ArrowRight']) move.add(right);
    if (move.lengthSq() > 0) camera.position.addScaledVector(move.normalize(), 3.2 * dt);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.2, 5.2);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -4.2, 4.2);
    camera.position.y = 1.6;
  });
  return null;
}

/* ---------- 3D Animated Ceiling Fan ---------- */
function CeilingFan({ position }: { position: [number, number, number] }) {
  const bladesRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.y = clock.elapsedTime * 6;
    }
  });

  return (
    <group position={position}>
      {/* Downrod */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Motor hub */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* 4 Blades */}
      <group ref={bladesRef} position={[0, -0.02, 0]}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <group key={i} rotation-y={angle}>
            <mesh position={[0.7, 0, 0]} castShadow>
              <boxGeometry args={[1.0, 0.02, 0.2]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ---------- 3D Room Ambient Dust Motes ---------- */
function RoomDust({ count = 60 }: { count?: number }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 8;
      coords[i * 3 + 1] = 0.5 + Math.random() * 2.2;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.elapsedTime * 0.2;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(time + i * 2) * 0.002;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#fde68a" transparent opacity={0.45} />
    </points>
  );
}

function Room() {
  const { floorMaterial, wallColor } = useSiteStore();
  const floor = FLOORS[floorMaterial];
  const tvBacklightRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (tvBacklightRef.current) {
      const pulse = 0.8 + Math.sin(clock.elapsedTime * 1.5) * 0.2;
      (tvBacklightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color={floor.color} roughness={floor.roughness} metalness={0.05} />
      </mesh>
      {/* walls */}
      <mesh position={[0, 1.6, -5]} receiveShadow><boxGeometry args={[12, 3.2, 0.15]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[-6, 1.6, 0]} receiveShadow><boxGeometry args={[0.15, 3.2, 10]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[6, 1.6, 0]} receiveShadow><boxGeometry args={[0.15, 3.2, 10]} /><meshStandardMaterial color={wallColor} /></mesh>
      {/* ceiling */}
      <mesh position={[0, 3.2, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[12, 10]} /><meshStandardMaterial color="#fafafa" /></mesh>

      {/* Animated Ceiling Fan */}
      <CeilingFan position={[0, 2.7, -1]} />

      {/* sofa */}
      <group position={[-2.6, 0, -3.4]}>
        <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[2.6, 0.5, 1]} /><meshStandardMaterial color="#3b4a6b" /></mesh>
        <mesh position={[0, 0.85, -0.4]} castShadow><boxGeometry args={[2.6, 0.8, 0.25]} /><meshStandardMaterial color="#31405c" /></mesh>
        {[-1.15, 1.15].map((x) => (
          <mesh key={x} position={[x, 0.7, 0]} castShadow><boxGeometry args={[0.3, 0.7, 1]} /><meshStandardMaterial color="#31405c" /></mesh>
        ))}
      </group>
      {/* coffee table + rug */}
      <mesh position={[-2.6, 0.28, -1.6]} castShadow><boxGeometry args={[1.3, 0.08, 0.7]} /><meshStandardMaterial color="#7c5a3a" roughness={0.3} /></mesh>
      {[[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[-2.6 + x, 0.12, -1.6 + z]}><cylinderGeometry args={[0.04, 0.04, 0.24]} /><meshStandardMaterial color="#333" /></mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[-2.6, 0.012, -2.2]}>
        <circleGeometry args={[1.7, 32]} />
        <meshStandardMaterial color="#c8b08a" roughness={1} />
      </mesh>

      {/* TV console on back wall with animated ambient glow */}
      <mesh ref={tvBacklightRef} position={[-2.6, 1.5, -4.94]}>
        <planeGeometry args={[2.3, 1.35]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-2.6, 1.5, -4.9]}><boxGeometry args={[2, 1.15, 0.06]} /><meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.4} /></mesh>

      {/* bookshelf */}
      <group position={[5.6, 0, 1.5]} rotation-y={-Math.PI / 2}>
        <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[1.6, 2, 0.35]} /><meshStandardMaterial color="#8a6a45" /></mesh>
        {[0.5, 1.0, 1.5].map((y) => (
          <mesh key={y} position={[0, y, 0.19]}><boxGeometry args={[1.45, 0.04, 0.02]} /><meshStandardMaterial color="#6b5136" /></mesh>
        ))}
      </group>
      {/* plant */}
      <group position={[4.8, 0, -4]}>
        <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.28, 0.22, 0.5]} /><meshStandardMaterial color="#b45309" /></mesh>
        <mesh position={[0, 0.95, 0]} castShadow><icosahedronGeometry args={[0.55, 1]} /><meshStandardMaterial color="#2f7d3f" roughness={0.9} /></mesh>
      </group>

      {/* Floating dust motes in room */}
      <RoomDust />

      {/* lighting */}
      <spotLight position={[0, 3.05, 0]} angle={0.9} penumbra={0.6} intensity={1.6} castShadow color="#fff5e0" />
      <pointLight position={[-4, 2.4, -3]} intensity={0.5} color="#ffe4b3" />
      <ambientLight intensity={0.45} />
    </group>
  );
}

export default function VillaTourScene() {
  const { floorMaterial, setFloorMaterial, wallColor, setWallColor } = useSiteStore();

  return (
    <div className="relative h-[80vh] w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
      <Canvas shadows camera={{ position: [0, 1.6, 3.5], fov: 68 }}>
        <fog attach="fog" args={['#111', 12, 24]} />
        <Room />
        <WalkControls />
        <PointerLockControls makeDefault selector="#tour-enter" />
      </Canvas>

      {/* click-to-enter overlay with modern vector badge */}
      <button id="tour-enter"
        className="group absolute inset-0 flex items-center justify-center bg-black/40 text-white transition hover:bg-black/30">
        <span className="flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-black/70 px-7 py-5 text-center shadow-2xl backdrop-blur transition group-hover:scale-105">
          <span className="flex items-center gap-2 text-lg font-bold">
            <Eye className="h-5 w-5 text-amber-400 animate-pulse" />
            <span>Click to Enter the Villa Walkthrough</span>
          </span>
          <span className="flex items-center gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1"><Move className="h-3.5 w-3.5 text-amber-400" /> Mouse to look around</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><Compass className="h-3.5 w-3.5 text-amber-400" /> W A S D to walk</span>
            <span>•</span>
            <span>ESC to exit</span>
          </span>
        </span>
      </button>

      {/* Material customizer */}
      <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Layers className="h-3.5 w-3.5 text-amber-600" />
          <span>Flooring Finish</span>
        </div>
        <div className="mt-2 flex gap-2">
          {(Object.keys(FLOORS) as FloorMaterial[]).map((f) => (
            <button key={f} onClick={() => setFloorMaterial(f)}
              className={`rounded-xl border-2 px-3 py-1.5 text-xs font-semibold transition ${floorMaterial === f ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-sm scale-105' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
              {FLOORS[f].label}
            </button>
          ))}
        </div>
        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Palette className="h-3.5 w-3.5 text-amber-600" />
          <span>Wall Paint</span>
        </div>
        <div className="mt-2 flex gap-2.5">
          {WALLS.map((c) => (
            <button key={c} onClick={() => setWallColor(c)} aria-label={`Wall ${c}`}
              className={`h-7 w-7 rounded-full border-2 transition ${wallColor === c ? 'border-amber-500 scale-125 shadow-md' : 'border-slate-300 hover:scale-110'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}
