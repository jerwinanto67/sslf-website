'use client';

import dynamic from 'next/dynamic';
import { Navbar, About, Projects, Trust, Contact, Footer, QuickSupportFloat } from '@/components/ui/Sections';
import { Loader2 } from 'lucide-react';
import { useSiteStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/i18n';

const Loader = ({ label }: { label: string }) => (
  <div className="flex flex-col h-[75vh] items-center justify-center rounded-3xl bg-slate-950 border border-slate-800 text-sm text-slate-400 gap-3">
    <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
    <span>Loading {label} experience…</span>
  </div>
);

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false, loading: () => <Loader label="3D township" /> });
const MasterPlanScene = dynamic(() => import('@/components/three/MasterPlanScene'), { ssr: false, loading: () => <Loader label="interactive master plan" /> });
const VillaTourScene = dynamic(() => import('@/components/three/VillaTourScene'), { ssr: false, loading: () => <Loader label="villa walkthrough" /> });
const LocationMapScene = dynamic(() => import('@/components/three/LocationMapScene'), { ssr: false, loading: () => <Loader label="3D location map" /> });

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-bold text-slate-900 md:text-4xl tracking-tight">{title}</h2>
      <p className="mt-2.5 text-sm md:text-base text-slate-500 max-w-xl mx-auto">{sub}</p>
    </div>
  );
}

export default function Home() {
  const { language } = useSiteStore();
  const t = TRANSLATIONS[language];

  return (
    <main className="min-h-screen bg-white selection:bg-amber-500 selection:text-white">
      <Navbar />
      <HeroScene />
      <About />
      <section id="plots" className="mx-auto max-w-7xl px-5 pb-24">
        <SectionHeading title={t.masterPlanTitle} sub={t.masterPlanSub} />
        <MasterPlanScene />
      </section>
      <Projects />
      <section id="tour" className="mx-auto max-w-7xl px-5 py-24">
        <SectionHeading title={t.villaTitle} sub={t.villaSub} />
        <VillaTourScene />
      </section>
      <section id="location" className="mx-auto max-w-7xl px-5 pb-24">
        <SectionHeading title={t.locationTitle} sub={t.locationSub} />
        <LocationMapScene />
      </section>
      <Trust />
      <Contact />
      <Footer />
      <QuickSupportFloat />
    </main>
  );
}
