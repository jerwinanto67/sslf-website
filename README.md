# SSLF City & Housing — 3D Interactive Real Estate Platform

An immersive, state-of-the-art 3D real estate web application built for **SSLF City & Housing (Sree Sarabeswaraa Land Foundation)**, Chennai's trusted real estate developer with 17+ years of excellence.

🌐 **GitHub Repository:** [https://github.com/jerwinanto67/sslf-website.git](https://github.com/jerwinanto67/sslf-website.git)

---

## 🌟 Key Features

### 1. 🏙️ 3D Hero Township Scene (`HeroScene.tsx`)
* **Procedural 3D Township:** Low-poly modern villas, avenues, lush swaying trees, and street lamps.
* **Animated Traffic:** Stylized moving vehicles gliding along roads with functioning headlights and taillights.
* **Smooth Day / Night Mode:** Realistic lighting rig lerping between daytime sunlight and ambient nighttime illumination with glowing windows, starry sky, and warm street lamps.
* **Clickable Project Pins:** Floating 3D beacons linking to major SSLF developments (*Padmavathi Nagar*, *Oragadam Enclave*, *City Square*).

### 2. 🗺️ Interactive Master Plan & EMI Calculator (`MasterPlanScene.tsx`)
* **32-Plot Interactive Layout:** Grid with status-based coloring (Available: Green, Reserved: Yellow, Booked: Red).
* **3D Survey Radar Beam & Compass:** Animated scanning laser and rotating 3D compass rose.
* **Vastu Facing Filter:** Live filter buttons (*All*, *East*, *North*) that isolate matching plots with dynamic opacity and elevation.
* **Interactive EMI Calculator:** Expandable financial widget calculating estimated monthly payments across 5Y, 10Y, 15Y, and 20Y tenures with 80% loan and 20% down payment breakdown.

### 3. 🏠 Virtual Villa Walkthrough (`VillaTourScene.tsx`)
* **First-Person Exploration:** Pointer-lock controls with mouse look and smooth WASD movement clamped within room bounds.
* **Detailed 3D Interior:** Sofa lounge, coffee table, rug, TV unit with pulsating LED backlight, and animated overhead ceiling fan.
* **Real-time Finish Swapper:** Seamlessly switch flooring materials (*Teak Wood*, *Italian Marble*, *Vitrified Tile*) and wall paint colors with instant PBR updates.

### 4. 🛰️ 3D Chennai Connectivity Network (`LocationMapScene.tsx`)
* **3D Topographical Terrain:** Procedural heightmap surface of the Chennai metropolitan region.
* **Animated Transit Corridors:** Luminous energy pulses traveling along transit routes linking SSLF HQ to Chennai International Airport, Sriperumbudur Corridor, GST Road / NH-45, and the Outer Ring Road.
* **Pulsing Beacon Hubs:** Dual radar rings marking core project regions.

### 5. 🌐 Bilingual Support (English & தமிழ்)
* **Instant Language Toggle:** Seamless switcher (`English` / `தமிழ்`) in the navigation bar updating all headings, tags, and project descriptions dynamically.

### 6. 📱 Modern UI & Floating Lead Generation
* **3D Perspective Tilt:** Interactive hardware-accelerated 3D hover effects on project cards and milestone statistics.
* **Quick Support Float:** Floating bottom-right action buttons for direct WhatsApp inquiries and one-tap sales calls.
* **Lead Capture Endpoint:** Serverless API route at `/api/lead` for callback requests and site visit bookings.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **3D Graphics:** [Three.js](https://threejs.org/) & [@react-three/fiber](https://r3f.docs.pmnd.rs/)
* **3D Helpers:** [@react-three/drei](https://github.com/pmndrs/drei)
* **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)

---

## 📂 Project Structure

```
sslf-website/
├── app/
│   ├── api/lead/route.ts       # Lead capture API route
│   ├── layout.tsx              # SEO metadata & JSON-LD schema
│   ├── page.tsx                # Page composition with lazy-loaded 3D scenes
│   └── globals.css             # Tailwind base styles
├── components/
│   ├── three/
│   │   ├── HeroScene.tsx       # 3D township with Day/Night & traffic
│   │   ├── MasterPlanScene.tsx # Master plan, EMI calculator & Vastu filter
│   │   ├── VillaTourScene.tsx  # First-person villa tour & material swapper
│   │   └── LocationMapScene.tsx# 3D terrain connectivity network
│   └── ui/
│       └── Sections.tsx        # Navbar, About, Projects, Trust, Contact, Floating CTA
├── lib/
│   ├── store.ts                # Zustand global state (day/night, language, plot selection)
│   ├── i18n.ts                 # Bilingual English / Tamil dictionary
│   └── data/plots.ts           # Plot inventory & pricing helpers
└── public/                     # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ installed
* npm, pnpm, or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/jerwinanto67/sslf-website.git
cd sslf-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 📄 License & Ownership
© 2026 SSLF City & Housing — Sree Sarabeswaraa Land Foundation. All rights reserved. ISO 9001:2015 Certified.
