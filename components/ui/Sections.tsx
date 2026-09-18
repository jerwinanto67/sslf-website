'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Building2,
  HeartHandshake,
  CalendarCheck,
  Send,
  Languages,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useSiteStore } from '@/lib/store';
import { TRANSLATIONS } from '@/lib/i18n';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
} as const;

export function Navbar() {
  const { language, toggleLanguage } = useSiteStore();
  const t = TRANSLATIONS[language];

  const links = [
    [t.projects, '#projects'],
    [t.masterPlan, '#plots'],
    [t.villaTour, '#tour'],
    [t.location, '#location'],
    [t.contact, '#contact'],
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <a href="#" className="flex items-center gap-2 text-lg font-bold text-white group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-sm shadow-md transition group-hover:scale-105">
            S
          </span>
          <span>
            SSLF <span className="text-amber-400">City &amp; Housing</span>
          </span>
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-medium text-slate-300 transition hover:text-amber-400">
              {label}
            </a>
          ))}

          {/* Bilingual Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            <Languages className="h-3.5 w-3.5 text-amber-400" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:scale-105 active:scale-95">
            <CalendarCheck className="h-4 w-4" />
            <span>{t.bookSiteVisit}</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

export function About() {
  const { language } = useSiteStore();
  const t = TRANSLATIONS[language];

  const stats = [
    { value: '17+', label: language === 'ta' ? 'ஆண்டுகால சிறப்பான சேவை' : 'Years of Excellence', icon: Award },
    { value: '1000s', label: language === 'ta' ? 'விற்பனை கூட்டாளர்கள்' : 'Sales Associates', icon: Users },
    { value: 'ISO 9001:2015', label: language === 'ta' ? 'சான்றளிக்கப்பட்ட தரம்' : 'Certified Quality', icon: ShieldCheck },
    { value: '100%', label: language === 'ta' ? 'DTCP & CMDA பட்டா' : 'DTCP & CMDA Titles', icon: CheckCircle2 },
  ];

  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24">
      <motion.div {...fadeUp} className="grid gap-12 md:grid-cols-2 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>{t.aboutTitle}</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">{t.aboutHeading}</h2>
          <p className="mt-5 leading-relaxed text-slate-600 text-base">
            {t.aboutP1}
          </p>
          <p className="mt-4 leading-relaxed text-slate-600 text-base">
            {t.aboutP2}
          </p>
        </div>

        {/* 3D animated tilt stat cards */}
        <div className="grid grid-cols-2 gap-4 [perspective:1000px]">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                whileHover={{ y: -6, rotateX: 5, rotateY: idx % 2 === 0 ? 5 : -5, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-xl transition duration-300 [transform-style:preserve-3d]"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-3 transition group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

const PROJECT_LIST = [
  { name: 'SSLF Oragadam Enclave', region: 'Oragadam', type: 'Plots', size: '600 – 2400 sq.ft', status: 'Ongoing' },
  { name: 'Padmavathi Nagar', region: 'Uthukottai', type: 'Plots', size: '800 – 1500 sq.ft', status: 'Ongoing' },
  { name: 'SSLF City Square', region: 'Ekkatuthangal', type: 'Apartments', size: '2 & 3 BHK', status: 'Ongoing' },
  { name: 'Sarabeswaraa Villas', region: 'Oragadam', type: 'Villas', size: '3 BHK Luxury', status: 'Completed' },
];

export function Projects() {
  const [filter, setFilter] = useState('All');
  const types = ['All', 'Plots', 'Apartments', 'Villas'];
  const list = PROJECT_LIST.filter((p) => filter === 'All' || p.type === filter);

  return (
    <section id="projects" className="bg-slate-50/80 py-24 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-5">
        <motion.div {...fadeUp}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>Prime Real Estate Portfolio</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Ongoing &amp; Completed Projects</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === t ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 3D perspective animated cards */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 [perspective:1200px]">
            {list.map((p) => (
              <motion.div
                key={p.name}
                whileHover={{ y: -8, rotateX: 4, rotateY: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-2xl transition duration-300 [transform-style:preserve-3d]"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${p.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{p.type}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-amber-600 transition">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{p.region}</span>
                </p>
                <p className="mt-3 text-sm font-bold text-amber-700 bg-amber-50/70 p-2.5 rounded-xl">{p.size}</p>
                <a href="#contact" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 group-hover:text-amber-700">
                  <span>Enquire Details</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Trust() {
  const { language } = useSiteStore();
  const t = TRANSLATIONS[language];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24">
      <motion.div
        {...fadeUp}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-10 text-white shadow-xl md:p-14"
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur mb-4">
            <HeartHandshake className="h-4 w-4 text-amber-200" />
            <span>Social Responsibility</span>
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">{t.charityTitle}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-amber-50 text-base">
            {t.charityP}
          </p>
        </div>
        {/* Subtle decorative 3D background spheres */}
        <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </motion.div>
    </section>
  );
}

export function Contact() {
  const { language } = useSiteStore();
  const t = TRANSLATIONS[language];

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: 'Plots', intent: 'Request Callback', message: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/lead', { method: 'POST', body: JSON.stringify(form) });
    setSent(true);
  };

  return (
    <section id="contact" className="bg-slate-950 py-24 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 items-center">
        <motion.div {...fadeUp}>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Reach Out Directly</span>
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">{t.contactTitle}</h2>
          <div className="mt-6 space-y-4 text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-1" />
              <p className="text-sm leading-relaxed">
                210, Defence Colony 15th Cross St, Ekkatuthangal,<br />
                Chennai, Tamil Nadu 600032
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-400 shrink-0" />
              <p className="text-sm">Open all days · 9:00 AM – 7:00 PM</p>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-400 shrink-0" />
              <p className="text-sm">SSLF Associates partner portal available for marketers</p>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => setForm({ ...form, intent: 'Request Callback' })}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${form.intent === 'Request Callback' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
              {t.requestCallback}
            </button>
            <button type="button" onClick={() => setForm({ ...form, intent: 'Schedule Site Visit' })}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${form.intent === 'Schedule Site Visit' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
              {t.scheduleVisit}
            </button>
          </div>
        </motion.div>

        <motion.form {...fadeUp} onSubmit={submit} className="rounded-3xl bg-white p-7 text-slate-900 shadow-2xl">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
              <p className="mt-4 text-xl font-bold">Thank you, {form.name.split(' ')[0]}!</p>
              <p className="mt-2 text-sm text-slate-500">Our team will reach out within 30 minutes during working hours.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <input required placeholder="Full Name *" value={form.name} onChange={set('name')} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-500 text-slate-900 focus:ring-1 focus:ring-amber-500" />
              <input required pattern="[0-9+ -]{10,}" placeholder="Phone *" value={form.phone} onChange={set('phone')} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-500 text-slate-900 focus:ring-1 focus:ring-amber-500" />
              <input type="email" placeholder="Email" value={form.email} onChange={set('email')} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-500 text-slate-900 focus:ring-1 focus:ring-amber-500" />
              <select value={form.interest} onChange={set('interest')} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-500 text-slate-900">
                {['Plots', 'Apartments', 'Villas', 'Become an Associate'].map((o) => <option key={o}>{o}</option>)}
              </select>
              <textarea placeholder="Message (preferred location, budget...)" rows={3} value={form.message} onChange={set('message')} className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-500 text-slate-900 focus:ring-1 focus:ring-amber-500" />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 font-bold text-white shadow-md transition hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]">
                <span>{form.intent}</span>
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}

/* Floating WhatsApp / Phone Quick Support Widget */
export function QuickSupportFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      <a
        href="https://wa.me/919840000000?text=Hi%20SSLF,%20I%20am%20interested%20in%20your%20Chennai%20plots%20and%20villas."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex items-center gap-2 rounded-full bg-emerald-600 p-3.5 text-white shadow-xl transition duration-300 hover:bg-emerald-500 hover:scale-110"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-xs group-hover:pr-2">
          Chat on WhatsApp
        </span>
      </a>
      <a
        href="tel:+919840000000"
        aria-label="Call SSLF Support"
        className="group flex items-center gap-2 rounded-full bg-amber-500 p-3.5 text-white shadow-xl transition duration-300 hover:bg-amber-600 hover:scale-110"
      >
        <Phone className="h-5 w-5" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-xs group-hover:pr-2">
          Call Sales Desk
        </span>
      </a>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-8 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} SSLF City &amp; Housing — Sree Sarabeswaraa Land Foundation · ISO 9001:2015 Certified
    </footer>
  );
}
