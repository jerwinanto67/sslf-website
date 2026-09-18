'use client';

import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Html, Float } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import { Sun, Moon, MapPin, X, ArrowUpRight } from 'lucide-react';
import { useSiteStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/i18n';

const PROJECTS = [
  { id: 'uthukottai', name: 'Padmavathi Nagar', region: 'Uthukottai', type: 'DTCP Plots', price: '₹14 L onwards', pos: [-9, 0, -6] as const },
  { id: 'oragadam', name: 'SSLF Oragadam Enclave', region: 'Oragadam', type: 'Villa Plots', price: '₹28 L onwards', pos: [8, 0, -7] as const },
  { id: 'ekkatuthangal', name: 'SSLF City Square', region: 'Ekkatuthangal', type: 'Apartments', price: '₹72 L onwards', pos: [6, 0, 7] as const },
];

/* ---------- Day/Night lighting rig ---------- */
function DayNightRig({ night }: { night: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null!);
  const amb = useRef<THREE.AmbientLight>(null!);
  useFrame((_, dt) => {
    if (!sun.current || !amb.current) return;
    sun.current.intensity = THREE.MathUtils.damp(sun.current.intensity, night ? 0.05 : 1.4, 2.5, dt);
    amb.current.intensity = THREE.MathUtils.damp(amb.current.intensity, night ? 0.25 : 0.6, 2.5, dt);
    sun.current.color.lerp(new THREE.Color(night ? '#8ab4ff' : '#ffffff'), dt * 2.5);
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.6} />
      <directionalLight ref={sun} position={[18, 24, 12]} intensity={1.4} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-25} shadow-camera-right={25}
        shadow-camera-top={25} shadow-camera-bottom={-25} />
      {night && <pointLight position={[0, 8, 0]} intensity={0.6} distance={25} color="#7aa2ff" />}
    </>
  );
}

/* ---------- Camera intro sweep ---------- */
function IntroCamera({ onDone }: { onDone: () => void }) {
  const { camera } = useThree();
  const t = useRef(0);
  const start = useMemo(() => new THREE.Vector3(45, 32, 48), []);
  const end = useMemo(() => new THREE.Vector3(21, 14, 23), []);
  useFrame((_, dt) => {
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + dt / 3);
    const e = 1 - Math.pow(1 - t.current, 3);
    camera.position.lerpVectors(start, end, e);
    camera.lookAt(0, 1, 0);
    if (t.current >= 1) onDone();
  });
  return null;
}

/* ---------- Procedural villa ---------- */
function Villa({ position, rotation = 0, night }: { position: [number, number, number]; rotation?: number; night: boolean }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 2, 2.2]} />
        <meshStandardMaterial color="#e8dfd0" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.55, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[2.1, 1.1, 4]} />
        <meshStandardMaterial color="#8d5a3b" roughness={0.7} />
      </mesh>
      {/* windows glow at night */}
      {[[-0.7, 1.1, 1.11], [0.7, 1.1, 1.11], [0, 1.1, -1.11]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <planeGeometry args={[0.7, 0.8]} />
          <meshStandardMaterial color="#1e293b"
            emissive={night ? '#ffd27d' : '#000000'} emissiveIntensity={night ? 1.6 : 0} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Animated Swaying Tree ---------- */
function SwayingTree({ position, delay }: { position: [number, number, number]; delay: number }) {
  const foliageRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (foliageRef.current) {
      const time = clock.elapsedTime * 1.5 + delay;
      foliageRef.current.rotation.z = Math.sin(time) * 0.05;
      foliageRef.current.rotation.x = Math.cos(time * 0.8) * 0.04;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1]} />
        <meshStandardMaterial color="#6b4a2f" />
      </mesh>
      <mesh ref={foliageRef} position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.7, 1.6, 8]} />
        <meshStandardMaterial color="#2f7d3f" roughness={0.9} />
      </mesh>
    </group>
  );
}

function StreetLamp({ position, night }: { position: [number, number, number]; night: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.05, 0.07, 2.8]} /><meshStandardMaterial color="#334155" /></mesh>
      <mesh position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#fef3c7" emissive={night ? '#ffdf8a' : '#000'} emissiveIntensity={night ? 2 : 0} />
      </mesh>
      {night && <pointLight position={[0, 2.7, 0]} intensity={1.2} distance={7} color="#ffd27d" />}
    </group>
  );
}

/* ---------- Animated Moving Vehicle on Township Road ---------- */
function AnimatedVehicle({ axis, offset, speed, color, night }: { axis: 'x' | 'z'; offset: number; speed: number; color: string; night: boolean }) {
  const meshRef = useRef<THREE.Group>(null!);
  const headlightRef = useRef<THREE.Mesh>(null!);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    if (axis === 'z') {
      meshRef.current.position.z += speed * dt;
      if (meshRef.current.position.z > 19) meshRef.current.position.z = -19;
      if (meshRef.current.position.z < -19) meshRef.current.position.z = 19;
    } else {
      meshRef.current.position.x += speed * dt;
      if (meshRef.current.position.x > 19) meshRef.current.position.x = -19;
      if (meshRef.current.position.x < -19) meshRef.current.position.x = 19;
    }
  });

  const isPositive = speed > 0;

  return (
    <group ref={meshRef} position={axis === 'z' ? [offset, 0.12, -18] : [-18, 0.12, offset]} rotation-y={axis === 'z' ? (isPositive ? 0 : Math.PI) : (isPositive ? Math.PI / 2 : -Math.PI / 2)}>
      {/* Car Body */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.7, 0.3, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Car Cabin */}
      <mesh position={[0, 0.38, -0.1]} castShadow>
        <boxGeometry args={[0.55, 0.22, 0.7]} />
        <meshStandardMaterial color="#1e293b" roughness={0.1} />
      </mesh>
      {/* Headlights */}
      <mesh ref={headlightRef} position={[0.22, 0.15, 0.66]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={night ? 2.5 : 0.8} />
      </mesh>
      <mesh position={[-0.22, 0.15, 0.66]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={night ? 2.5 : 0.8} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.22, 0.15, -0.66]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={night ? 2.0 : 0.5} />
      </mesh>
      <mesh position={[-0.22, 0.15, -0.66]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={night ? 2.0 : 0.5} />
      </mesh>
      {night && <pointLight position={[0, 0.3, 1.0]} intensity={0.6} distance={4} color="#fffbe6" />}
    </group>
  );
}

/* ---------- Dynamic Ambient 3D Floating Particles ---------- */
function AmbientParticles({ count = 100, night }: { count?: number; night: boolean }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 45;
      coords[i * 3 + 1] = 1 + Math.random() * 8;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.elapsedTime * 0.15;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(time + i) * 0.005;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={night ? 0.22 : 0.15}
        color={night ? '#facc15' : '#ffffff'}
        transparent
        opacity={night ? 0.8 : 0.4}
      />
    </points>
  );
}

/* ---------- Township layout ---------- */
function Township({ night }: { night: boolean }) {
  const villas = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number }[] = [];
    for (let gx = -2; gx <= 2; gx++)
      for (let gz = -2; gz <= 2; gz++) {
        if (gx === 0 || gz === 0) continue; // leave roads
        arr.push({ pos: [gx * 5.4, 0, gz * 5.4], rot: (gz > 0 ? Math.PI : 0) + (gx > 0 ? Math.PI / 2 : -Math.PI / 2) * 0 });
      }
    return arr;
  }, []);

  return (
    <group>
      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={night ? '#1a3325' : '#4c7a4a'} roughness={1} />
      </mesh>
      {/* roads */}
      {[-0, 0].map((_, i) => (
        <group key={i}>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
            <planeGeometry args={[3, 40]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} rotation-z={Math.PI / 2}>
            <planeGeometry args={[3, 40]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
        </group>
      ))}
      {villas.map((v, i) => <Villa key={i} position={v.pos} rotation={v.rot} night={night} />)}
      {/* Animated swaying trees along roads */}
      {Array.from({ length: 10 }, (_, i) => (
        <SwayingTree key={i} delay={i * 0.4} position={[i % 2 === 0 ? 2.2 : -2.2, 0, -16 + i * 3.4]} />
      ))}
      {[-8, 0, 8].map((z, i) => <StreetLamp key={i} position={[1.8, 0, z]} night={night} />)}

      {/* Animated vehicles driving on the roads */}
      <AnimatedVehicle axis="z" offset={0.7} speed={3.8} color="#f59e0b" night={night} />
      <AnimatedVehicle axis="z" offset={-0.7} speed={-3.2} color="#0284c7" night={night} />
      <AnimatedVehicle axis="x" offset={0.7} speed={4.2} color="#e11d48" night={night} />
      <AnimatedVehicle axis="x" offset={-0.7} speed={-3.5} color="#10b981" night={night} />

      {/* Ambient floating 3D dust / fireflies */}
      <AmbientParticles night={night} />
    </group>
  );
}

/* ---------- Clickable project pins with animated concentric pulse rings ---------- */
function ProjectPin({ project, night }: { project: (typeof PROJECTS)[number]; night: boolean }) {
  const setActiveProject = useSiteStore((s) => s.setActiveProject);
  const ringRef1 = useRef<THREE.Mesh>(null!);
  const ringRef2 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringRef1.current) {
      const s1 = 1 + (t % 1.5) * 0.8;
      ringRef1.current.scale.set(s1, s1, s1);
      (ringRef1.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (t % 1.5) / 1.5);
    }
    if (ringRef2.current) {
      const s2 = 1 + ((t + 0.75) % 1.5) * 0.8;
      ringRef2.current.scale.set(s2, s2, s2);
      (ringRef2.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - ((t + 0.75) % 1.5) / 1.5);
    }
  });

  return (
    <group position={[project.pos[0], 0, project.pos[2]]}>
      <Float speed={2.5} floatIntensity={1.2} floatingRange={[0, 0.35]}>
        {/* Animated Beacon Ring 1 */}
        <mesh ref={ringRef1} position={[0, 4.2, 0]} rotation-x={Math.PI / 2}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Animated Beacon Ring 2 */}
        <mesh ref={ringRef2} position={[0, 4.2, 0]} rotation-x={Math.PI / 2}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[0, 4.2, 0]}
          onClick={(e) => { e.stopPropagation(); setActiveProject(project.id); }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={night ? 0.9 : 0.35} />
        </mesh>
        <Html position={[0, 5.1, 0]} center distanceFactor={22} style={{ pointerEvents: 'none' }}>
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-400/40 bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            {project.name}
          </div>
        </Html>
      </Float>
    </group>
  );
}

/* ---------- Exported scene ---------- */
export default function HeroScene() {
  const { isNight, toggleDayNight, activeProject, setActiveProject, language } = useSiteStore();
  const t = TRANSLATIONS[language];
  const [introDone, setIntroDone] = useState(false);
  const active = PROJECTS.find((p) => p.id === activeProject);

  return (
    <div className="relative h-[92vh] w-full overflow-hidden bg-slate-950">
      <Canvas shadows camera={{ position: [45, 32, 48], fov: 45 }}
        onPointerMissed={() => setActiveProject(null)}>
        <IntroCamera onDone={() => setIntroDone(true)} />
        <DayNightRig night={isNight} />
        {isNight
          ? <Stars radius={120} depth={40} count={3000} factor={4} fade speed={0.6} />
          : <Sky sunPosition={[60, 40, 30]} turbidity={6} rayleigh={1.2} />}
        <fog attach="fog" args={[isNight ? '#0a0f1e' : '#dbeafe', 45, 95]} />
        <Township night={isNight} />
        {PROJECTS.map((p) => <ProjectPin key={p.id} project={p} night={isNight} />)}
        <OrbitControls makeDefault enabled={introDone} enablePan={false}
          autoRotate autoRotateSpeed={0.5}
          minDistance={12} maxDistance={45} maxPolarAngle={Math.PI / 2.15}
          target={[0, 1, 0]} />
      </Canvas>

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center pt-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 backdrop-blur mb-3">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          {t.heroTag}
        </div>
        <h1 className="max-w-3xl px-4 text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
          {t.heroTitle1} <span className="text-amber-400">{t.heroTitle2}</span>
        </h1>
        <p className="mt-4 max-w-xl px-4 text-sm text-slate-200 md:text-lg">
          {t.heroSub}
        </p>
      </div>

      {/* Day / Night Toggle - Clean Vector Icons without raw emojis */}
      <button onClick={toggleDayNight}
        className="absolute right-5 top-24 flex items-center gap-2.5 rounded-full border border-white/20 bg-slate-900/80 px-4 py-2 text-sm font-medium text-white shadow-xl backdrop-blur transition hover:bg-slate-900 hover:scale-105 active:scale-95">
        {isNight ? (
          <>
            <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0" />
            <span>{t.dayView}</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-indigo-300 transition-transform -rotate-12" />
            <span>{t.nightView}</span>
          </>
        )}
      </button>

      {/* Project card on pin click */}
      {active && (
        <div className="absolute bottom-8 left-1/2 w-[92%] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur">
          <button onClick={() => setActiveProject(null)} className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
            <MapPin className="h-3.5 w-3.5" />
            <span>{active.region} · {active.type}</span>
          </div>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{active.name}</h3>
          <p className="mt-1 text-sm text-slate-600">Clear-title DTCP/CMDA approved · Vastu-compliant layouts</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-semibold text-emerald-700">{active.price}</span>
            <a href="#contact" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600">
              <span>{t.bookSiteVisit}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
