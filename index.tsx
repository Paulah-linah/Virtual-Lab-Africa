import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Beaker as BeakerIcon, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Users, 
  ChevronRight, 
  FlaskConical, 
  Cpu, 
  LayoutDashboard, 
  MessageSquare, 
  Search, 
  Globe,
  Play,
  Info, 
  CheckCircle2, 
  AlertCircle,
  Accessibility, 
  ArrowRight,
  Sparkles,
  Zap,
  Flame, 
  ShieldAlert,
  Trophy,
  History,
  LayoutGrid,
  ChevronLeft,
  X,
  User,
  User2,
  UserCheck,
  UserPlus,
  Leaf,
  Menu,
  Droplets,
  Thermometer,
  Plus,
  Activity,
  Award,
  ZapOff,
  Star,
  ShieldCheck,
  Languages,
  Eye,
  Type,
  Home,
  Terminal,
  Wind,
  Scaling,
  Weight,
  Heart,
  Target,
  Quote,
  Shield,
  Stethoscope,
  Lightbulb,
  Microscope
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types & Interfaces ---
type AppView = 'landing' | 'onboarding' | 'selection' | 'lab' | 'admin' | 'about';
type EducationSection = 'Junior' | 'Senior' | 'Diploma';
type LearningArea = 'Chemistry' | 'Physics' | 'Biology' | 'Integrated Science' | 'Agriculture' | 'Home Science' | 'Pre-Technical' | 'Computer Science';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number; // 0: 100%, 1: 125%, 2: 150%
  dyslexicFont: boolean;
  reducedMotion: boolean;
  largeTargets: boolean;
  audioCues: boolean;
}

interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  badges: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// --- Context for State Management ---
const AppStateContext = createContext<{
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  view: AppView;
  setView: (v: AppView) => void;
  accessibility: AccessibilitySettings;
  setAccessibility: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
} | null>(null);

const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppStateProvider");
  return context;
};

// --- Data Constants ---
const SECTIONS = [
  { id: 'Junior', title: 'Junior School', subtitle: 'Grades 7–9', icon: <BookOpen />, color: 'bg-cyan-50 text-cyan-600' },
  { id: 'Senior', title: 'Senior School', subtitle: 'Form 1–4', icon: <GraduationCap />, color: 'bg-orange-50 text-orange-600' },
  { id: 'Diploma', title: 'Diploma in Secondary Teacher Education', subtitle: 'DSTE Curriculum', icon: <Users />, color: 'bg-purple-50 text-purple-600' },
];

const GRADES = {
  Junior: ['Grade 7', 'Grade 8', 'Grade 9'],
  Senior: ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
  Diploma: ['Year 1', 'Year 2', 'Year 3']
};

const GRADE_SUBJECTS: Record<string, LearningArea[]> = {
  'Grade 7': ['Integrated Science', 'Agriculture', 'Home Science', 'Pre-Technical', 'Computer Science'],
  'Grade 8': ['Integrated Science', 'Agriculture', 'Home Science', 'Pre-Technical', 'Computer Science'],
  'Grade 9': ['Integrated Science', 'Agriculture', 'Home Science', 'Pre-Technical', 'Computer Science'],
  'Form 1': ['Physics', 'Chemistry', 'Biology', 'Agriculture'],
  'Form 2': ['Physics', 'Chemistry', 'Biology', 'Agriculture'],
  'Form 3': ['Physics', 'Chemistry', 'Biology', 'Agriculture'],
  'Form 4': ['Physics', 'Chemistry', 'Biology', 'Agriculture'],
  'Year 1': ['Physics', 'Chemistry', 'Biology'],
  'Year 2': ['Physics', 'Chemistry', 'Biology'],
  'Year 3': ['Physics', 'Chemistry', 'Biology'],
};

const SUBJECT_LIST: Record<LearningArea, { icon: React.ReactNode; color: string; bgColor: string; desc: string }> = {
  'Physics': { icon: <Zap />, color: 'text-indigo-600', bgColor: 'bg-indigo-50', desc: 'Mechanics and Energy' },
  'Chemistry': { icon: <FlaskConical />, color: 'text-rose-500', bgColor: 'bg-rose-50', desc: 'Reactions and Matter' },
  'Biology': { icon: <Leaf />, color: 'text-emerald-500', bgColor: 'bg-emerald-50', desc: 'Life and Cells' },
  'Integrated Science': { icon: <Sparkles />, color: 'text-purple-500', bgColor: 'bg-purple-50', desc: 'Holistic STEM Exploration' },
  'Agriculture': { icon: <Globe />, color: 'text-green-600', bgColor: 'bg-green-50', desc: 'Sustainable Farming' },
  'Home Science': { icon: <Home />, color: 'text-orange-500', bgColor: 'bg-orange-50', desc: 'Nutrition and Household' },
  'Pre-Technical': { icon: <Settings />, color: 'text-slate-600', bgColor: 'bg-slate-100', desc: 'Engineering and Mechanics' },
  'Computer Science': { icon: <Cpu />, color: 'text-cyan-500', bgColor: 'bg-cyan-50', desc: 'Coding and Hardware' },
};

const SUBJECT_EXPERIMENTS: Record<string, { id: string; title: string; desc: string; icon: React.ReactNode }[]> = {
  'Integrated Science': [
    { 
      id: 'bunsen-burner',
      title: 'Apparatus for Heating: Bunsen Burner', 
      desc: 'Learn parts of the Bunsen burner, air hole adjustment, and flame types (Luminous vs Non-luminous).', 
      icon: <Flame className="w-12 h-12" /> 
    },
    { 
      id: 'beam-balance',
      title: 'Apparatus for Measuring Mass: Beam Balance', 
      desc: 'Discover how to measure mass using a beam balance and standard masses.', 
      icon: <Scaling className="w-12 h-12" /> 
    },
    { 
      id: 'thermometer',
      title: 'Apparatus for Measuring Temperature: Thermometer', 
      desc: 'Learn how to read a thermometer and measure temperatures of different substances.', 
      icon: <Thermometer className="w-12 h-12" /> 
    },
  ],
  'Agriculture': [
    { id: 'soil-test', title: 'Soil Testing', desc: 'Analyzing soil pH and composition.', icon: <Globe className="w-12 h-12" /> }
  ],
  'Home Science': [
    { id: 'food-pres', title: 'Food Preservation', desc: 'Traditional and modern food preservation.', icon: <Home className="w-12 h-12" /> }
  ],
  'Pre-Technical': [
    { id: 'circuitry', title: 'Basic Circuitry', desc: 'Introduction to electronics.', icon: <Zap className="w-12 h-12" /> }
  ],
  'Computer Science': [
    { id: 'hardware-id', title: 'Hardware Identification', desc: 'Identify components of a computer.', icon: <Cpu className="w-12 h-12" /> }
  ]
};

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo"
];

const STUDENT_IMG = new URL('./Student.png', import.meta.url).href;

// --- Apparatus Components ---

const RealisticBunsenBurner = ({ airHoleLevel, isLit }: { airHoleLevel: number, isLit: boolean }) => {
  return (
    <div className="relative flex flex-col items-center select-none pt-16 transition-transform duration-500 scale-[var(--apparatus-scale)]">
      <div className="relative">
        {isLit && (
          <svg
            width="180"
            height="210"
            viewBox="0 0 180 210"
            className="absolute -top-36 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <defs>
              <radialGradient id="flameGlow" cx="50%" cy="60%" r="60%">
                <stop offset="0%" stopColor={airHoleLevel >= 2 ? '#67E8F9' : '#FDE68A'} stopOpacity="0.65" />
                <stop offset="55%" stopColor={airHoleLevel >= 2 ? '#3B82F6' : '#F59E0B'} stopOpacity="0.22" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="outerFlame" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={airHoleLevel >= 2 ? '#60A5FA' : '#FB923C'} stopOpacity="0.95" />
                <stop offset="55%" stopColor={airHoleLevel >= 2 ? '#22D3EE' : '#FDE68A'} stopOpacity="0.92" />
                <stop offset="100%" stopColor={airHoleLevel >= 2 ? '#E0F2FE' : '#FFF7ED'} stopOpacity="0.88" />
              </linearGradient>
              <linearGradient id="innerFlame" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={airHoleLevel >= 2 ? '#1D4ED8' : '#F59E0B'} stopOpacity="0.9" />
                <stop offset="100%" stopColor={airHoleLevel >= 2 ? '#93C5FD' : '#FEF3C7'} stopOpacity="0.65" />
              </linearGradient>
              <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            <g style={{ transformOrigin: '90px 190px', transform: `scale(${[0.85, 0.95, 1.15, 1.3][airHoleLevel]})` }}>
              <ellipse cx="90" cy="150" rx="62" ry="48" fill="url(#flameGlow)" filter="url(#softBlur)" />
              <path
                d="M90 30 C72 58 66 78 66 102 C66 134 80 156 90 178 C100 156 114 134 114 102 C114 78 108 58 90 30 Z"
                fill="url(#outerFlame)"
                opacity="0.95"
              />
              {airHoleLevel >= 2 ? (
                <path
                  d="M90 64 C81 80 78 94 78 110 C78 132 86 148 90 160 C94 148 102 132 102 110 C102 94 99 80 90 64 Z"
                  fill="url(#innerFlame)"
                  opacity="0.95"
                />
              ) : (
                <path
                  d="M90 84 C84 98 82 112 82 124 C82 142 88 156 90 164 C92 156 98 142 98 124 C98 112 96 98 90 84 Z"
                  fill="url(#innerFlame)"
                  opacity="0.45"
                />
              )}
            </g>
          </svg>
        )}

        <svg width="260" height="380" viewBox="0 0 260 380" className="drop-shadow-2xl">
          <defs>
            <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="12%" stopColor="#F8FAFC" />
              <stop offset="32%" stopColor="#CBD5E1" />
              <stop offset="55%" stopColor="#F1F5F9" />
              <stop offset="78%" stopColor="#9CA3AF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="chromeDark" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="blueBase" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="55%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="blueBaseDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B2A7A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0B2A7A" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="baseShadow" cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="130" cy="350" rx="108" ry="22" fill="url(#baseShadow)" />

          {/* blue base (matches reference) */}
          <path
            d="M64 332 C64 300 90 276 130 276 C170 276 196 300 196 332 C196 360 170 368 130 368 C90 368 64 360 64 332 Z"
            fill="url(#blueBase)"
          />
          <path
            d="M78 330 C78 306 98 292 130 292 C162 292 182 306 182 330 C182 346 162 354 130 354 C98 354 78 346 78 330 Z"
            fill="#0B1220"
            opacity="0.18"
          />
          <path
            d="M64 332 C64 300 90 276 130 276 C170 276 196 300 196 332 C196 360 170 368 130 368 C90 368 64 360 64 332 Z"
            fill="url(#blueBaseDark)"
          />

          {/* side gas inlet nozzle */}
          <g>
            <rect x="44" y="302" width="58" height="18" rx="9" fill="#1E40AF" />
            <rect x="40" y="306" width="18" height="10" rx="5" fill="#1D4ED8" />
            <rect x="58" y="306" width="38" height="10" rx="5" fill="#60A5FA" opacity="0.35" />
            <rect x="50" y="296" width="16" height="30" rx="8" fill="#0B2A7A" opacity="0.55" />
          </g>

          {/* burner neck into base */}
          <path d="M104 286 C108 260 114 242 118 224 C120 214 124 202 125 190 L135 190 C136 202 140 214 142 224 C146 242 152 260 156 286 Z" fill="#1F2937" opacity="0.35" />

          {/* tall chrome barrel */}
          <rect x="114" y="42" width="32" height="240" rx="12" fill="url(#chrome)" stroke="#9CA3AF" strokeOpacity="0.55" />
          <rect x="119" y="52" width="22" height="218" rx="10" fill="#FFFFFF" opacity="0.18" />

          {/* top lip */}
          <rect x="110" y="30" width="40" height="18" rx="8" fill="url(#chromeDark)" opacity="0.95" />
          <rect x="114" y="34" width="32" height="10" rx="5" fill="#F8FAFC" opacity="0.35" />

          {/* collar window/control (simple) */}
          <rect x="106" y="176" width="48" height="44" rx="18" fill="#D1D5DB" opacity="0.95" />
          <rect x="112" y="182" width="36" height="32" rx="14" fill="#111827" opacity="0.16" />
          <g style={{ transformOrigin: '130px 198px', transform: `rotate(${airHoleLevel * 22}deg)` }}>
            <rect x="124" y="186" width="12" height="24" rx="6" fill="#334155" />
            <circle cx="130" cy="198" r="5" fill="#0F172A" opacity="0.6" />
          </g>
        </svg>
      </div>
    </div>
  );
};

const RealisticBeamBalance = ({ leftMass, rightMass }: { leftMass: number, rightMass: number }) => {
  const diff = rightMass - leftMass;
  const maxTilt = 15;
  const tilt = Math.max(-maxTilt, Math.min(maxTilt, diff / 10));

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full pt-6 transition-transform duration-500 scale-[var(--apparatus-scale)]">
      <svg width="520" height="420" viewBox="0 0 520 420" className="w-full max-w-[360px] sm:max-w-[460px] md:max-w-[520px] h-auto drop-shadow-2xl">
        <defs>
          <linearGradient id="bbMetal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="18%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="82%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="bbDark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0B1220" />
          </linearGradient>
          <radialGradient id="bbShadow" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* base shadow */}
        <ellipse cx="260" cy="392" rx="190" ry="22" fill="url(#bbShadow)" />

        {/* base */}
        <path d="M150 368 C150 340 175 322 260 322 C345 322 370 340 370 368 C370 392 345 402 260 402 C175 402 150 392 150 368 Z" fill="url(#bbDark)" />
        <path d="M166 366 C166 350 186 338 260 338 C334 338 354 350 354 366 C354 378 334 386 260 386 C186 386 166 378 166 366 Z" fill="#111827" opacity="0.35" />

        {/* pillar */}
        <rect x="242" y="110" width="36" height="220" rx="14" fill="url(#bbMetal)" stroke="#94A3B8" strokeOpacity="0.55" />
        <rect x="250" y="126" width="20" height="190" rx="10" fill="#FFFFFF" opacity="0.18" />
        <circle cx="260" cy="150" r="26" fill="#0F172A" opacity="0.85" />
        <circle cx="260" cy="150" r="20" fill="#CBD5E1" opacity="0.35" />

        {/* beam + pans group (tilts) */}
        <g style={{ transformOrigin: '260px 160px', transform: `rotate(${tilt}deg)` }}>
          {/* beam */}
          <rect x="110" y="150" width="300" height="18" rx="9" fill="url(#bbMetal)" stroke="#94A3B8" strokeOpacity="0.55" />
          <rect x="120" y="154" width="280" height="10" rx="5" fill="#0F172A" opacity="0.10" />

          {/* left hanger */}
          <line x1="140" y1="168" x2="140" y2="250" stroke="#94A3B8" strokeWidth="4" />
          <line x1="140" y1="250" x2="120" y2="270" stroke="#94A3B8" strokeWidth="3" />
          <line x1="140" y1="250" x2="160" y2="270" stroke="#94A3B8" strokeWidth="3" />
          {/* left pan */}
          <path d="M90 276 C98 292 122 300 140 300 C158 300 182 292 190 276 Z" fill="#E2E8F0" stroke="#CBD5E1" />
          <ellipse cx="140" cy="276" rx="52" ry="10" fill="#CBD5E1" opacity="0.6" />

          {/* right hanger */}
          <line x1="380" y1="168" x2="380" y2="250" stroke="#94A3B8" strokeWidth="4" />
          <line x1="380" y1="250" x2="360" y2="270" stroke="#94A3B8" strokeWidth="3" />
          <line x1="380" y1="250" x2="400" y2="270" stroke="#94A3B8" strokeWidth="3" />
          {/* right pan */}
          <path d="M330 276 C338 292 362 300 380 300 C398 300 422 292 430 276 Z" fill="#E2E8F0" stroke="#CBD5E1" />
          <ellipse cx="380" cy="276" rx="52" ry="10" fill="#CBD5E1" opacity="0.6" />

          {/* weights (simple cylinders) */}
          {leftMass > 0 && (
            <g>
              <rect x="126" y="246" width="28" height="26" rx="6" fill="#9CA3AF" />
              <rect x="130" y="250" width="20" height="18" rx="5" fill="#F1F5F9" opacity="0.35" />
              <text x="140" y="264" textAnchor="middle" fontSize="10" fontWeight="800" fill="#334155">{leftMass}g</text>
            </g>
          )}
          {rightMass > 0 && (
            <g>
              <rect x="366" y="246" width="28" height="26" rx="6" fill="#9CA3AF" />
              <rect x="370" y="250" width="20" height="18" rx="5" fill="#F1F5F9" opacity="0.35" />
              <text x="380" y="264" textAnchor="middle" fontSize="10" fontWeight="800" fill="#334155">{rightMass}g</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

const RealisticThermometer = ({ temperature, sampleId }: { temperature: number; sampleId?: 'room' | 'ice' | 'warm' | 'hot' | 'body' }) => {
  const heightPercent = Math.max(0, Math.min(100, ((temperature + 10) / 120) * 100));
  const isHot = sampleId === 'hot';
  const isIce = sampleId === 'ice';
  const isWarm = sampleId === 'warm';
  const isBody = sampleId === 'body';
  const sampleLabel = isIce ? 'Ice Water' : isHot ? 'Hot Water' : isWarm ? 'Warm Water' : isBody ? 'Body Temp' : 'Room Air';
  
  return (
    <div className="relative flex flex-col items-center justify-center select-none z-20 transition-transform duration-500 scale-[var(--apparatus-scale)]">
       <div className="relative w-full flex flex-col items-center">
         <div className="relative w-10 md:w-11">
           <div className="relative w-10 md:w-11 h-[220px] md:h-[300px] bg-white/80 border-2 border-slate-300 rounded-full flex flex-col items-center justify-end p-2 shadow-lg backdrop-blur-sm">
            
            <div className="absolute right-full mr-5 h-[190px] md:h-[250px] bottom-[20px] flex flex-col justify-between items-end text-[10px] font-black text-slate-700 leading-none">
               {[110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0, -10].map(val => (
                 <div key={val} className="flex items-center gap-3 h-0 relative">
                    <span className="absolute right-6 whitespace-nowrap">{val}°C</span>
                    <div className={`h-px bg-slate-500 ${val % 10 === 0 ? 'w-5' : 'w-2'}`} />
                 </div>
               ))}
            </div>

            <div className="absolute left-2 top-6 bottom-12 w-2 bg-white/30 rounded-full blur-sm" />
            <div className="absolute right-2 top-10 bottom-16 w-1.5 bg-white/20 rounded-full blur-sm" />

            <div className="relative w-3 md:w-3.5 h-[190px] md:h-[250px] bg-slate-200/40 rounded-full border border-slate-300/50 overflow-hidden mb-4">
               <div 
                 className="absolute bottom-0 left-0 right-0 bg-rose-600 transition-all duration-1000 ease-in-out shadow-[inset_-2px_0_6px_rgba(0,0,0,0.3)]" 
                 style={{ height: `${heightPercent}%` }}
               >
                  <div className="absolute right-1 top-0 bottom-0 w-0.5 bg-white/40" />
                  {/* meniscus highlight */}
                  <div className="absolute -top-1 left-0 right-0 h-2 bg-white/30 blur-[0.5px]" />
               </div>
            </div>
            
            <div className="absolute -bottom-7 w-16 md:w-20 h-16 md:h-20 bg-rose-600 border-4 border-slate-200 rounded-full shadow-[0_4px_18px_rgba(244,63,94,0.55)] z-10 flex items-center justify-center">
               <div className="absolute top-3 right-4 w-5 md:w-6 h-5 md:h-6 bg-white/30 rounded-full blur-[2px]" />
            </div>
           </div>
         </div>

         {/* beaker below thermometer (bulb dips into beaker) */}
         <div className="relative -mt-2 md:-mt-3 pointer-events-none">
           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36 md:w-44 h-9 bg-black/10 rounded-full blur-md" />
           <svg width="180" height="180" viewBox="0 0 220 220" className="relative mx-auto">
             <defs>
               <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.65" />
                 <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.25" />
                 <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.75" />
               </linearGradient>
               <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor={isHot ? '#FB7185' : isWarm ? '#F59E0B' : isIce ? '#38BDF8' : isBody ? '#F97316' : '#60A5FA'} stopOpacity="0.9" />
                 <stop offset="100%" stopColor={isHot ? '#EF4444' : isWarm ? '#D97706' : isIce ? '#0EA5E9' : isBody ? '#EA580C' : '#3B82F6'} stopOpacity="0.95" />
               </linearGradient>
               <filter id="steam" x="-40%" y="-40%" width="180%" height="180%">
                 <feGaussianBlur stdDeviation="2.5" />
               </filter>
             </defs>

             {/* beaker body */}
             <path d="M52 50 H168 V160 C168 188 146 206 110 206 C74 206 52 188 52 160 Z" fill="url(#glass)" stroke="#CBD5E1" strokeWidth="2" />
             <path d="M56 50 H164" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
             <path d="M64 58 H76" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
             <path d="M80 58 H96" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.35" />

             {/* liquid */}
             <path
               d="M62 122 C80 132 98 136 110 136 C122 136 140 132 158 122 V160 C158 178 142 190 110 190 C78 190 62 178 62 160 Z"
               fill="url(#liquid)"
               opacity="0.85"
             />
             <path d="M62 122 C82 110 98 106 110 106 C122 106 138 110 158 122" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="3" />

             {/* ice cubes */}
             {isIce && (
               <g opacity="0.95">
                 <rect x="78" y="122" width="26" height="20" rx="4" fill="#E0F2FE" stroke="#7DD3FC" />
                 <rect x="112" y="128" width="24" height="18" rx="4" fill="#E0F2FE" stroke="#7DD3FC" />
                 <rect x="94" y="142" width="22" height="16" rx="4" fill="#E0F2FE" stroke="#7DD3FC" />
               </g>
             )}

             {/* steam */}
             {isHot && (
               <g filter="url(#steam)" opacity="0.55">
                 <path d="M84 42 C74 28 90 16 84 6" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
                 <path d="M112 42 C102 28 118 16 112 6" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
                 <path d="M140 42 C130 28 146 16 140 6" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
               </g>
             )}
           </svg>
           <div className="-mt-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">{sampleLabel}</div>
         </div>
       </div>

       <div className="mt-8 w-40 md:w-48 rounded-2xl border border-slate-200 bg-slate-900 shadow-xl px-4 py-3">
         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Reading</div>
         <div className="mt-1 flex items-end justify-between">
           <div className="font-black text-3xl md:text-4xl tracking-tight text-emerald-300 tabular-nums">
             {Math.round(temperature)}
           </div>
           <div className="font-black text-sm text-emerald-200">°C</div>
         </div>
         <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
           <div className="h-full bg-emerald-400" style={{ width: `${Math.max(0, Math.min(100, (Math.round(temperature) + 10) / 120 * 100))}%` }} />
         </div>
       </div>
    </div>
  );
};

// --- Navbar ---

const Navbar = () => {
  const { profile, setView, setAccessibility, accessibility, view } = useAppState();
  const [showAccMenu, setShowAccMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const isLabView = view === 'lab';

  const XP_PER_LEVEL = 1000;
  const totalXp = profile.xp || 0;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const xpPct = (xpIntoLevel / XP_PER_LEVEL) * 100;

  const navLinks = [
    { label: 'Virtual Labs', icon: <FlaskConical className="w-5 h-5" />, action: () => setView('selection') },
    { label: 'Curriculum', icon: <BookOpen className="w-5 h-5" />, action: () => setView('selection') },
    { label: 'About', icon: <Info className="w-5 h-5" />, action: () => setView('about') },
  ];

  const handleToggle = (key: keyof AccessibilitySettings) => {
    setAccessibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFontSize = (val: number) => {
    setAccessibility(prev => ({ ...prev, fontSize: val }));
  };

  const handleNavLinkClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };
  
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] border-b px-4 md:px-6 py-4 flex items-center justify-between transition-colors ${isLabView ? 'bg-white border-slate-200 shadow-sm' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button 
            aria-label="Toggle Menu"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="bg-[#249e91] p-2 rounded-lg transition-transform group-hover:scale-105 shadow-sm">
              <BeakerIcon className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${isLabView ? 'text-slate-900' : 'text-[#1e293b]'}`}>
              VirtuLab <span className={isLabView ? 'text-[#249e91]' : 'text-[#1e293b]'}>Africa</span>
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button 
              key={link.label} 
              onClick={link.action}
              className={`text-sm font-bold transition-all ${
                (link.label === 'About' && view === 'about') || (link.label === 'Virtual Labs' && view === 'selection') ? 'text-[#249e91]' : 'text-slate-400 hover:text-[#249e91]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button 
              aria-label="Accessibility Settings"
              onClick={() => setShowAccMenu(!showAccMenu)}
              className={`p-2 rounded-full transition-colors ${showAccMenu ? 'bg-[#249e91] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              <Accessibility className="w-5 h-5" />
            </button>
            
            {showAccMenu && (
              <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-[110] animate-in slide-in-from-top-4 duration-300 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <Accessibility className="text-[#249e91] w-6 h-6" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Inclusive Design</h4>
                    <p className="text-xs text-slate-400">Personalize your learning experience</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Visual Aid Category */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Visual Assistance</p>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm"><Eye className="w-4 h-4 text-slate-600" /></div>
                        <span className="text-sm font-bold text-slate-700">High Contrast</span>
                      </div>
                      <button onClick={() => handleToggle('highContrast')} className={`w-12 h-6 rounded-full relative transition-colors ${accessibility.highContrast ? 'bg-[#249e91]' : 'bg-slate-200'}`}><div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 shadow-sm transition-all ${accessibility.highContrast ? 'right-0.75' : 'left-0.75'}`} /></button>
                    </div>
                    <div className="flex flex-col gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 transition-colors">
                      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-white shadow-sm"><Scaling className="w-4 h-4 text-slate-600" /></div><span className="text-sm font-bold text-slate-700">Font Size</span></div>
                      <div className="flex gap-1">
                        {[100, 125, 150].map((size, idx) => (
                          <button key={size} onClick={() => handleFontSize(idx)} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${accessibility.fontSize === idx ? 'bg-[#249e91] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}>{size}%</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 transition-colors">
                      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-white shadow-sm"><Type className="w-4 h-4 text-slate-600" /></div><span className="text-sm font-bold text-slate-700">Dyslexic Friendly</span></div>
                      <button onClick={() => handleToggle('dyslexicFont')} className={`w-12 h-6 rounded-full relative transition-colors ${accessibility.dyslexicFont ? 'bg-[#249e91]' : 'bg-slate-200'}`}><div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 shadow-sm transition-all ${accessibility.dyslexicFont ? 'right-0.75' : 'left-0.75'}`} /></button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Other Assistance</p>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 transition-colors">
                      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-white shadow-sm"><Target className="w-4 h-4 text-slate-600" /></div><span className="text-sm font-bold text-slate-700">Large Targets</span></div>
                      <button onClick={() => handleToggle('largeTargets')} className={`w-12 h-6 rounded-full relative transition-colors ${accessibility.largeTargets ? 'bg-[#249e91]' : 'bg-slate-200'}`}><div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 shadow-sm transition-all ${accessibility.largeTargets ? 'right-0.75' : 'left-0.75'}`} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              aria-label="Profile"
              onClick={(e) => {
                e.stopPropagation();
                setShowProfile(!showProfile);
              }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-200 p-0.5 overflow-hidden transition-transform hover:scale-110 hover:shadow-[0_0_18px_rgba(36,158,145,0.35)] hover:border-[#249e91]"
            >
              <img
                src={profile.avatar}
                className="w-full h-full object-cover rounded-full"
                alt="User Profile"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = AVATARS[0];
                }}
              />
            </button>

            {showProfile && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[120]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar}
                      className="w-12 h-12 rounded-full border-2 border-[#249e91] p-0.5"
                      alt="Profile"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = AVATARS[0];
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-[#249e91]" />
                        <p className="font-bold text-slate-800">Scientist {profile.name || 'Scientist'}</p>
                      </div>
                      <p className="text-xs text-slate-500">Level {level} • {totalXp} XP</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                      <span>XP Progress</span>
                      <span>{xpIntoLevel}/{XP_PER_LEVEL}</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#249e91] to-[#1a7a73]"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showProfile && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setShowProfile(false)}
        />
      )}

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl p-6 animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-[#249e91] p-2 rounded-lkmg">
                  <BeakerIcon className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">VirtuLab Africa</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button 
                  key={link.label}
                  onClick={() => handleNavLinkClick(link.action)}
                  className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 text-sm font-bold transition-all ${
                    (link.label === 'About' && view === 'about') || (link.label === 'Virtual Labs' && view === 'selection') 
                    ? 'bg-[#249e91]/10 text-[#249e91]' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={ (link.label === 'About' && view === 'about') || (link.label === 'Virtual Labs' && view === 'selection') ? 'text-[#249e91]' : 'text-slate-400' }>
                    {link.icon}
                  </span>
                  {link.label}
                </button>
              ))}
            </div>

            <div className="mt-auto border-t pt-8">
              <div className="flex items-center gap-4 px-4 py-4 bg-slate-50 rounded-2xl mb-4">
                <img src={profile.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="User" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{profile.name || 'Scientist'}</p>
                  <p className="text-[10px] text-[#249e91] font-black uppercase tracking-widest">{profile.xp} XP Earned</p>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">VirtuLab Africa © 2025</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Landing Page ---

const Landing = ({ onStartLearning }: { onStartLearning: () => void }) => {
  const { setView } = useAppState();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-b from-[#1c4d57] to-[#122b31]">
      {/* Background Scientific Imagery Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-25">
        <svg className="absolute top-20 left-[-50px] w-64 h-full text-cyan-400/40" viewBox="0 0 100 1000" preserveAspectRatio="none">
          <path d="M 50 0 Q 80 50 50 100 Q 20 150 50 200 Q 80 250 50 300 Q 20 350 50 400 Q 80 450 50 500 Q 20 550 50 600 Q 80 650 50 700 Q 20 750 50 800 Q 80 850 50 900 Q 20 950 50 1000" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 50 0 Q 20 50 50 100 Q 80 150 50 200 Q 20 250 50 300 Q 80 350 50 400 Q 20 450 50 500 Q 80 550 50 600 Q 20 650 50 700 Q 80 750 50 800 Q 20 850 50 900 Q 80 950 50 1000" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <svg className="absolute bottom-20 right-[-50px] w-48 h-full text-orange-400/30 rotate-12" viewBox="0 0 100 1000" preserveAspectRatio="none">
          <path d="M 50 0 Q 70 40 50 80 Q 30 120 50 160 Q 70 200 50 240 Q 30 280 50 320 Q 70 360 50 400 Q 30 440 50 480 Q 70 520 50 560 Q 30 600 50 640 Q 70 680 50 720" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path d="M 50 0 Q 30 40 50 80 Q 70 120 50 160 Q 30 200 50 240 Q 70 280 50 320 Q 30 360 50 400 Q 70 440 50 480 Q 30 520 50 560 Q 70 600 50 640 Q 30 680 50 720" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>

        <div className="absolute top-[15%] right-[10%] text-white/50">
           <svg width="120" height="120" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.6" />
             <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.4" />
             <circle cx="80" cy="20" r="5" fill="currentColor" opacity="0.4" />
             <circle cx="20" cy="80" r="5" fill="currentColor" opacity="0.4" />
             <circle cx="80" cy="80" r="5" fill="currentColor" opacity="0.4" />
             <line x1="50" y1="50" x2="20" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.3" />
             <line x1="50" y1="50" x2="80" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.3" />
             <line x1="50" y1="50" x2="20" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.3" />
             <line x1="50" y1="50" x2="80" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.3" />
           </svg>
        </div>

        <div className="absolute bottom-[20%] left-[5%] text-cyan-200/40">
           <svg width="150" height="150" viewBox="0 0 100 100">
              <polygon points="50,10 90,35 90,75 50,95 10,75 10,35" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="10" r="4" fill="currentColor" />
              <circle cx="90" cy="35" r="4" fill="currentColor" />
              <circle cx="90" cy="75" r="4" fill="currentColor" />
              <circle cx="50" cy="95" r="4" fill="currentColor" />
              <circle cx="10" cy="75" r="4" fill="currentColor" />
              <circle cx="10" cy="35" r="4" fill="currentColor" />
           </svg>
        </div>

        <div className="absolute top-[22%] left-[18%] text-white/40 font-mono text-2xl select-none font-bold">E = mc²</div>
        <div className="absolute bottom-[28%] right-[18%] text-white/35 font-mono text-xl select-none font-bold">H₂O + CO₂ → C₆H₁₂O₆</div>
        <div className="absolute top-[48%] right-[8%] text-white/20 font-mono text-3xl select-none font-bold">F = ma</div>
        <div className="absolute bottom-[12%] left-[22%] text-white/40 font-mono text-lg select-none font-bold">λ = h / p</div>
        <div className="absolute top-[8%] left-[38%] text-white/25 font-mono text-4xl select-none font-bold">ΔS ≥ 0</div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center px-6">
        <h1 className="text-4xl md:text-8xl font-black text-white leading-tight mb-6 md:mb-8 tracking-tighter">
          Virtual Labs for <br />
          <span className="text-[#f17143]">Future Scientists</span>
        </h1>
        <p className="text-slate-100/80 text-base md:text-xl mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
          Empowering African STEM students with immersive practical learning designed for every device.
        </p>
        <button onClick={onStartLearning} className="bg-[#249e91] text-white px-8 md:px-10 py-4 rounded-xl text-base md:text-lg font-bold transition-all hover:bg-[#1d8277] shadow-lg flex items-center gap-2">
          Start Learning <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

// --- Selection ---

const Selection = ({ onExperimentSelect }: { onExperimentSelect: (exp: any) => void }) => {
  const { setView } = useAppState();
  const [selection, setSelection] = useState<{ section: EducationSection | null, grade: string | null, subject: LearningArea | null }>({
    section: null,
    grade: null,
    subject: null,
  });

  const step = !selection.section ? 'level' : (!selection.grade ? 'grade' : (!selection.subject ? 'subject' : 'experiment'));

  return (
    <section className="relative min-h-screen bg-slate-50 flex flex-col items-center pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="relative z-10 w-full max-w-6xl text-center">
        <h2 className="text-3xl md:text-7xl font-black text-[#1e293b] tracking-tighter mb-4 px-2">
          {step === 'level' && 'Choose Your Level'}
          {step === 'grade' && 'Select Your Grade'}
          {step === 'subject' && 'Choose Your Subject'}
          {step === 'experiment' && 'Select Practical'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 w-full justify-items-center mt-12">
          {step === 'level' && SECTIONS.map((sec) => (
            <button key={sec.id} onClick={() => setSelection({ ...selection, section: sec.id as EducationSection })} className="group w-full max-w-[380px] bg-white rounded-[2rem] p-8 md:p-12 flex flex-col items-center transition-all hover:-translate-y-4 shadow-sm border border-gray-100">
              <div className={`w-20 h-20 md:w-28 md:h-28 ${sec.color} rounded-[1.5rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>{sec.icon}</div>
              <h4 className="text-xl md:text-2xl font-black text-[#1e293b] mb-2 uppercase tracking-tight">{sec.title}</h4>
            </button>
          ))}

          {step === 'grade' && selection.section && GRADES[selection.section].map((gradeName, idx) => {
            const gradeIcon = selection.section === 'Junior' ? <BookOpen className="w-6 h-6" /> : (selection.section === 'Senior' ? <GraduationCap className="w-6 h-6" /> : <Users className="w-6 h-6" />);
            const palettes = [
              { tileBg: 'bg-orange-50', tileText: 'text-orange-500' },
              { tileBg: 'bg-cyan-50', tileText: 'text-cyan-600' },
              { tileBg: 'bg-purple-50', tileText: 'text-purple-600' },
              { tileBg: 'bg-emerald-50', tileText: 'text-emerald-600' },
              { tileBg: 'bg-amber-50', tileText: 'text-amber-600' },
              { tileBg: 'bg-indigo-50', tileText: 'text-indigo-600' },
            ];
            const p = palettes[idx % palettes.length];

            return (
              <button
                key={gradeName}
                onClick={() => setSelection({ ...selection, grade: gradeName })}
                className="group w-full max-w-[380px] bg-white rounded-[2rem] p-10 md:p-12 flex flex-col items-center transition-all hover:-translate-y-4 shadow-sm border border-gray-100"
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 ${p.tileBg} ${p.tileText} rounded-[1.75rem] flex items-center justify-center mb-7 transition-transform group-hover:scale-110`}>
                  {gradeIcon}
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-[#1e293b] text-center tracking-tight">{gradeName}</h4>
              </button>
            );
          })}

          {step === 'subject' && selection.grade && GRADE_SUBJECTS[selection.grade]?.map((name) => (
            <button key={name} onClick={() => setSelection({ ...selection, subject: name })} className="group w-full max-w-[380px] bg-white rounded-[2rem] p-8 md:p-12 flex flex-col items-center transition-all hover:-translate-y-4 shadow-sm border border-gray-100">
              <div className={`w-20 h-20 md:w-28 md:h-28 ${SUBJECT_LIST[name].bgColor} ${SUBJECT_LIST[name].color} rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-all`}>{SUBJECT_LIST[name].icon}</div>
              <h4 className="text-xl md:text-2xl font-black text-[#1e293b] mb-2 text-center tracking-tight">{name}</h4>
            </button>
          ))}

          {step === 'experiment' && selection.subject && SUBJECT_EXPERIMENTS[selection.subject]?.map((exp, idx) => (
            <button key={idx} onClick={() => { onExperimentSelect(exp); setView('lab'); }} className="group w-full max-w-[380px] bg-white rounded-[2rem] p-8 md:p-12 flex flex-col items-center transition-all hover:-translate-y-4 shadow-sm border border-gray-100">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-[#249e91]/10 text-[#249e91] rounded-[1.5rem] flex items-center justify-center mb-6">{exp.icon}</div>
              <h4 className="text-xl md:text-2xl font-black text-[#1e293b] mb-4 text-center leading-tight">{exp.title}</h4>
              <p className="text-slate-400 font-bold text-xs md:text-sm tracking-tight text-center">{exp.desc}</p>
            </button>
          ))}
        </div>

        {step !== 'level' && (
          <button onClick={() => { if (step === 'grade') setSelection({ ...selection, section: null }); if (step === 'subject') setSelection({ ...selection, grade: null }); if (step === 'experiment') setSelection({ ...selection, subject: null }); }} className="mt-12 text-slate-400 font-bold flex items-center gap-2 mx-auto">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        )}
      </div>
    </section>
  );
};

// --- LabBench Component ---

const LabBench = ({ experiment, user, onComplete }: { experiment: any, user: UserProfile, onComplete: (xp: number) => void }) => {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: `Habari Scientist ${user.name}! I'm your VirtuLab Assistant. We are starting "${experiment.title}". Ask me anything about this practical and I will guide you.` }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isBurnerLit, setIsBurnerLit] = useState(false);
  const [airHoleLevel, setAirHoleLevel] = useState(0); 
  const [temp, setTemp] = useState(25);
  const [thermoSampleId, setThermoSampleId] = useState<'room' | 'ice' | 'warm' | 'hot' | 'body'>('room');
  const [leftWeights, setLeftWeights] = useState<number[]>([]);
  const [rightWeights, setRightWeights] = useState<number[]>([]);
  const [containerScale, setContainerScale] = useState(1);
  const experimentAreaRef = useRef<HTMLDivElement>(null);

  const getOfflineLabGuideAnswer = (question: string) => {
    const q = question.toLowerCase();
    if (experiment.id === 'bunsen-burner') {
      if (q.includes('luminous')) {
        return "A luminous flame is a yellow/orange Bunsen burner flame produced when the air hole is mostly closed (less oxygen). It is cooler, gives off more light, and can produce soot because combustion is incomplete.";
      }
      if (q.includes('non-luminous') || q.includes('blue')) {
        return "A non-luminous flame is a blue flame produced when the air hole is open (more oxygen). It is hotter, quieter, and burns more cleanly (complete combustion).";
      }
      if (q.includes('air hole') || q.includes('collar')) {
        return "The collar/air hole controls how much air (oxygen) mixes with the gas. More air makes a hotter blue flame; less air makes a yellow luminous flame.";
      }
      if (q.includes('hotter') || q.includes('temperature')) {
        return "The blue non-luminous flame is hotter than the yellow luminous flame because it has more oxygen and burns more completely.";
      }
      if (q.includes('safety') || q.includes('safe')) {
        return "Safety: close the air hole before lighting, keep flammables away, never point the burner at anyone, and turn off gas when finished.";
      }
      return "Ask about: luminous vs non-luminous flame, the air hole/collar, why flames change color, which flame is hotter, or safety rules.";
    }
    if (experiment.id === 'beam-balance') {
      if (q.includes('used for') || q.includes('use')) {
        return "A beam balance is used to measure mass by comparing an unknown object with known standard masses. You add standard masses until the beam is level (balanced).";
      }
      if (q.includes('balanced') || q.includes('level')) {
        const d = rightMass - leftMass;
        if (Math.abs(d) <= 1) return "The beam is balanced when both pans are equal in mass and the beam is level (no tilt). In this simulation, you are balanced when left mass and right mass are the same (or within 1g).";
        return `Right now it is NOT balanced. ${d > 0 ? `The right side is heavier by ${Math.abs(d)}g.` : `The left side is heavier by ${Math.abs(d)}g.`} Add mass to the lighter side or remove from the heavier side.`;
      }
      if (q.includes('unknown') || q.includes('measure')) {
        return "To measure an unknown mass: place the object on one pan, then add standard masses to the other pan until the beam is level. The unknown mass equals the total standard masses used.";
      }
      if (q.includes('error') || q.includes('mistake')) {
        return "Common errors: not zeroing the balance first, parallax when reading the pointer, friction at the pivot, air currents, dirty/wet pans, and using incorrect standard masses.";
      }
      return "Ask about: what a beam balance is used for, how to know when it is balanced, measuring an unknown mass, or common sources of error.";
    }
    if (experiment.id === 'thermometer') {
      if (q.includes('objective')) {
        return "Objective: learn how to read a thermometer and compare temperatures of different materials (e.g., ice water vs warm water vs body temperature).";
      }
      if (q.includes('digital') || q.includes('reading') || q.includes('read')) {
        return "Read the temperature at eye level. Use the digital display (°C) and note the value once it stabilizes.";
      }
      if (q.includes('ice')) {
        return "Ice water is usually around 0°C (it can be slightly above 0°C if the ice is melting or if there is salt).";
      }
      if (q.includes('body') || q.includes('human')) {
        return "Normal human body temperature is about 37°C (it can vary slightly).";
      }
      if (q.includes('why') && (q.includes('change') || q.includes('rise') || q.includes('fall'))) {
        return "The thermometer changes because heat flows from the warmer object to the cooler object until they reach thermal equilibrium.";
      }
      return "Ask about: how to read a thermometer, why temperature changes, typical values (ice water ~0°C, body ~37°C), or the objective.";
    }
    return "I can help with this practical, but AI is currently unavailable. Ask a question directly about the experiment.";
  };

  const guidedQuestions = (() => {
    if (experiment.id === 'bunsen-burner') {
      return [
        'What is a luminous flame?',
        'What is a non-luminous (blue) flame?',
        'Which flame is hotter and why?',
        'What does the air hole/collar control?',
        'What are the safety rules when using a Bunsen burner?'
      ];
    }
    if (experiment.id === 'beam-balance') {
      return [
        'What is a beam balance used for?',
        'How do I know when the beam is balanced?',
        'How do I measure an unknown mass using standard masses?',
        'What are common sources of error in a beam balance?' 
      ];
    }
    if (experiment.id === 'thermometer') {
      return [
        'How do I read a thermometer correctly?',
        'Why does the thermometer reading change over time?',
        'What temperature should ice water be?',
        'What is normal human body temperature?',
      ];
    }
    return [
      'What is the objective of this experiment?',
      'What safety steps should I follow?',
      'What should I observe and record?',
      'What could cause errors in this practical?'
    ];
  })();

  const thermoSamples = [
    { id: 'ice' as const, label: 'Ice Water', desc: 'Cold sample', target: 0 },
    { id: 'room' as const, label: 'Room Air', desc: 'Ambient', target: 25 },
    { id: 'warm' as const, label: 'Warm Water', desc: 'Comfort warm', target: 40 },
    { id: 'body' as const, label: 'Body Temp', desc: 'Human', target: 37 },
    { id: 'hot' as const, label: 'Hot Water', desc: 'Very hot', target: 80 },
  ];
  const thermoTarget = thermoSamples.find(s => s.id === thermoSampleId)?.target ?? 25;

  const leftMass = leftWeights.reduce((a, b) => a + b, 0);
  const rightMass = rightWeights.reduce((a, b) => a + b, 0);
  const availableMasses = [1, 2, 5, 10, 20, 50, 100];

  const massDiff = rightMass - leftMass;
  const isBalanced = experiment.id === 'beam-balance' ? Math.abs(massDiff) <= 1 : false;
  const balanceText = experiment.id !== 'beam-balance'
    ? ''
    : isBalanced
      ? `Balanced ✓ (Left ${leftMass}g = Right ${rightMass}g)`
      : massDiff > 0
        ? `Not balanced: Right heavier by ${Math.abs(massDiff)}g`
        : `Not balanced: Left heavier by ${Math.abs(massDiff)}g`;

  const addWeight = (side: 'left' | 'right', mass: number) => {
    if (side === 'left') setLeftWeights(prev => [...prev, mass]);
    else setRightWeights(prev => [...prev, mass]);
  };
  const undoWeight = (side: 'left' | 'right') => {
    if (side === 'left') setLeftWeights(prev => prev.slice(0, -1));
    else setRightWeights(prev => prev.slice(0, -1));
  };
  const clearWeights = () => { setLeftWeights([]); setRightWeights([]); };

  useEffect(() => {
    const handleResize = () => {
      if (!experimentAreaRef.current) return;
      // Use width-only scaling to avoid a feedback loop where scaled content increases
      // the container height, which then increases scale again.
      const next = Math.min(experimentAreaRef.current.offsetWidth / 520, 1.1);
      setContainerScale(prev => (Math.abs(prev - next) < 0.01 ? prev : next));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  useEffect(() => {
    let timer: number;
    if (isBurnerLit && experiment.id === 'bunsen-burner') {
      timer = window.setInterval(() => {
        const base = [40, 55, 75, 95][airHoleLevel];
        setTemp(prev => Math.min(base + 5, prev + 1 + airHoleLevel * 0.2));
      }, 900);
    } else { timer = window.setInterval(() => { setTemp(prev => prev > 25 ? prev - 0.5 : 25); }, 1000); }
    return () => clearInterval(timer);
  }, [isBurnerLit, airHoleLevel, experiment.id]);

  useEffect(() => {
    if (experiment.id !== 'thermometer') return;
    const timer = window.setInterval(() => {
      setTemp(prev => {
        const diff = thermoTarget - prev;
        if (Math.abs(diff) < 0.2) return thermoTarget;
        const step = Math.max(0.15, Math.min(1.2, Math.abs(diff) * 0.08));
        return prev + Math.sign(diff) * step;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [experiment.id, thermoTarget]);

  const sendLabGuideMessage = async (rawMsg: string) => {
    const userMsg = rawMsg.trim();
    if (!userMsg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    try {
      if (experiment.id === 'beam-balance') {
        setMessages(prev => [...prev, { role: 'assistant', content: getOfflineLabGuideAnswer(userMsg) }]);
        return;
      }
      if (experiment.id === 'thermometer') {
        setMessages(prev => [...prev, { role: 'assistant', content: getOfflineLabGuideAnswer(userMsg) }]);
        return;
      }
      // Re-initialize for each request to ensure we have the most current API key
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Gemini API key missing. Add VITE_GEMINI_API_KEY to .env.local and restart the dev server." }]);
        return;
      }

      const recentChat = messages.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      const apparatusState = experiment.id === 'bunsen-burner'
        ? `Apparatus state: burnerLit=${isBurnerLit}; airHoleLevel=${airHoleLevel} (0=Close,1=Slightly,2=Half,3=Fully); temperatureC=${Math.round(temp)}.`
        : `Apparatus state: temperatureC=${Math.round(temp)}.`;

      const ai = new GoogleGenAI({ apiKey });
      const prompt = [
        `You are the VirtuLab Lab Guide.`,
        `Experiment Title: ${experiment.title}`,
        `Experiment Description: ${experiment.desc || ''}`,
        `Experiment Id: ${experiment.id}`,
        apparatusState,
        `Conversation so far (most recent):\n${recentChat}`,
        `Student question: ${userMsg}`,
        `Answer as a science lab instructor. Be accurate, practical, and safety-conscious. If the question is not about this experiment, politely redirect back to this experiment.`
      ].join('\n\n');

      const modelsToTry = [
        // Commonly available model IDs for the @google/genai (v1beta) endpoint
        'gemini-2.0-flash-001',
        'gemini-2.0-flash',
        'gemini-1.5-flash-002',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro-002',
        'gemini-1.5-pro-001',
        // some projects expose these aliases
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
      ];

      let responseText: string | undefined;
      let lastErr: any = null;
      for (const model of modelsToTry) {
        try {
          const resp = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { systemInstruction: "You are a science lab instructor for the current experiment. Give concise, step-by-step guidance and answer questions specifically about the experiment." }
          });
          responseText = resp.text;
          break;
        } catch (err: any) {
          lastErr = err;
          const msg = typeof err?.message === 'string' ? err.message : '';
          if (!msg.toLowerCase().includes('not found')) {
            break;
          }
        }
      }

      if (!responseText) {
        const tried = modelsToTry.join(', ');
        const baseMsg = lastErr?.message ? String(lastErr.message) : 'No compatible Gemini model found.';
        throw new Error(`${baseMsg} (tried: ${tried})`);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText || "Indeed!" }]);
    } catch (e: any) {
      console.error('Lab Guide error:', e);
      const msg = typeof e?.message === 'string' ? e.message : 'Unknown error';
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded') || msg.includes('429')) {
        setMessages(prev => [...prev, { role: 'assistant', content: getOfflineLabGuideAnswer(userMsg) }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Lab Guide error: ${msg}. Check VITE_GEMINI_API_KEY in .env.local and restart the dev server.` }]);
      }
    } finally { setIsTyping(false); }
  };

  const handleSendMessage = async () => sendLabGuideMessage(input);

  return (
    <div className="min-h-screen bg-white pt-20 pb-8 px-4 md:px-6 font-sans overflow-x-hidden" style={{ "--apparatus-scale": containerScale } as any}>
      <div className="max-w-screen-2xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 h-full">
        <div className="lg:col-span-8 flex flex-col gap-6 h-full items-center">
          <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] shadow-sm p-6 md:p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-6 h-6 text-[#249e91]" />
                  <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">Experiment Brief</h3>
                </div>
                <p className="mt-3 text-slate-600 font-semibold leading-relaxed">{experiment.desc}</p>
                {experiment.id === 'bunsen-burner' && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objective</p>
                      <p className="mt-2 text-sm font-bold text-slate-700">Identify parts of a Bunsen burner and explain flame types.</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key idea</p>
                      <p className="mt-2 text-sm font-bold text-slate-700">More air → hotter blue flame (non-luminous). Less air → yellow flame (luminous).</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety</p>
                      <p className="mt-2 text-sm font-bold text-slate-700">Keep the air hole closed when lighting. Never point the flame at people.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden md:flex flex-col items-end gap-2 text-slate-400">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><MessageSquare className="w-4 h-4" />Ask the Lab Guide</div>
                <div className="text-xs font-bold">
                  {experiment.id === 'beam-balance'
                    ? 'Try: “How do I know when the beam is balanced?”'
                    : experiment.id === 'thermometer'
                      ? 'Try: “Why does the thermometer reading change over time?”'
                      : 'Try: “What is a luminous flame?”'}
                </div>
              </div>
            </div>
          </div>
          <div ref={experimentAreaRef} className="flex-1 w-full bg-[#f8fafc] border-2 border-slate-200 rounded-[2.5rem] shadow-inner flex flex-col items-center justify-between py-12 min-h-[600px] lg:min-h-0">
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter text-center">{experiment.title}</h3>
            {experiment.id === 'beam-balance' && (
              <div className={`mt-3 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest ${isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                {balanceText}
              </div>
            )}
            <div className="flex-1 w-full flex items-center justify-center p-8">
              {experiment.id === 'bunsen-burner' && <RealisticBunsenBurner airHoleLevel={airHoleLevel} isLit={isBurnerLit} />}
              {experiment.id === 'beam-balance' && <RealisticBeamBalance leftMass={leftMass} rightMass={rightMass} />}
              {experiment.id === 'thermometer' && <RealisticThermometer temperature={temp} sampleId={thermoSampleId} />}
            </div>
            {experiment.id === 'bunsen-burner' && (
              <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-4 w-full max-w-md mx-auto">
                <span className="text-xs font-black uppercase text-slate-500 text-center">Collar Adjustment</span>
                <div className="flex gap-2">
                  {['Close', 'Slightly', 'Half', 'Fully'].map((lbl, idx) => (
                    <button key={idx} onClick={() => setAirHoleLevel(idx)} className={`flex-1 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase ${airHoleLevel === idx ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400'}`}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}
            {experiment.id === 'beam-balance' && (
              <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-4 w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase text-slate-500">Standard Masses</span>
                  <button onClick={clearWeights} className="text-xs font-black uppercase text-slate-500 hover:text-red-600 transition-colors">Clear</button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {availableMasses.map(m => (
                    <div key={m} className="flex flex-col gap-2">
                      <div className="text-center text-[10px] font-black text-slate-500">{m}g</div>
                      <button onClick={() => addWeight('left', m)} className="py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 font-black text-[10px] uppercase hover:border-slate-400">Left</button>
                      <button onClick={() => addWeight('right', m)} className="py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 font-black text-[10px] uppercase hover:border-slate-400">Right</button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Left Pan</div>
                      <button onClick={() => undoWeight('left')} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-900">Undo</button>
                    </div>
                    <div className="mt-2 text-sm font-black text-slate-800">{leftMass}g</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">[{leftWeights.join(', ') || '—'}]</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Right Pan</div>
                      <button onClick={() => undoWeight('right')} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-900">Undo</button>
                    </div>
                    <div className="mt-2 text-sm font-black text-slate-800">{rightMass}g</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">[{rightWeights.join(', ') || '—'}]</div>
                  </div>
                </div>
              </div>
            )}
            {experiment.id === 'thermometer' && (
              <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-4 w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase text-slate-500">Samples to Measure</span>
                  <div className="text-xs font-black text-slate-500">Current: {Math.round(temp)}°C</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {thermoSamples.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setThermoSampleId(s.id)}
                      className={`text-left px-4 py-3 rounded-2xl border-2 transition-colors ${thermoSampleId === s.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400'}`}
                    >
                      <div className="text-[11px] font-black uppercase tracking-widest">{s.label}</div>
                      <div className={`text-xs font-semibold ${thermoSampleId === s.id ? 'text-white/80' : 'text-slate-500'}`}>{s.desc}</div>
                      <div className={`mt-2 text-sm font-black ${thermoSampleId === s.id ? 'text-emerald-300' : 'text-emerald-700'}`}>Target ~ {s.target}°C</div>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  Place the thermometer in the selected sample and wait for the reading to stabilize.
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
            {experiment.id === 'bunsen-burner' && <button onClick={() => setIsBurnerLit(!isBurnerLit)} className={`p-6 rounded-[2rem] border-2 transition-all font-black uppercase tracking-tight text-xl ${isBurnerLit ? 'bg-red-50 border-red-200 text-red-600' : 'bg-[#249e91]/5 border-[#249e91]/20 text-[#249e91]'}`}>{isBurnerLit ? 'Turn Off' : 'Light Burner'}</button>}
            <button onClick={() => onComplete(500)} className="p-6 rounded-[2rem] bg-slate-900 text-white font-black uppercase text-xl flex items-center justify-center gap-4">Finish Practical <ChevronRight /></button>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col h-[500px] lg:h-full">
           <div className="flex-1 border-2 border-slate-200 bg-white shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex items-center gap-4 bg-slate-50/50"><MessageSquare className="w-6 h-6" /><h3 className="font-black text-xs uppercase tracking-tighter">Lab Guide</h3></div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                 {messages.map((msg, i) => (<div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}><div className={`px-4 py-3 rounded-[1.5rem] text-sm font-semibold max-w-[95%] ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>{msg.content}</div></div>))}
              </div>
              <div className="p-6 border-t">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Guided Questions</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {guidedQuestions.map((q) => (
                    <button
                      key={q}
                      disabled={isTyping}
                      onClick={() => sendLabGuideMessage(q)}
                      className={`text-left px-4 py-3 rounded-2xl border-2 transition-colors font-bold text-sm ${isTyping ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- About Section ---

const AboutSection = () => {
  const { setView } = useAppState();
  return (
    <section className="relative min-h-screen pt-24 pb-24 px-4 md:px-6 bg-slate-50 overflow-hidden">
      {/* Subtle background icons for About Page */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-around flex-wrap p-20 select-none">
        <DnaIcon className="w-48 h-48 -rotate-12" />
        <MoleculeIcon className="w-32 h-32 rotate-45" />
        <BeakerIcon className="w-56 h-56 rotate-12" />
        <Microscope className="w-40 h-40 -rotate-45" />
        <DnaIcon className="w-36 h-36 rotate-180" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <button 
          onClick={() => setView('landing')} 
          className="mb-12 text-slate-400 hover:text-[#249e91] font-bold flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </button>

        {/* Header Section */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-7xl font-black text-[#1e293b] tracking-tighter mb-8">About VirtuLab Africa</h2>
          <p className="text-lg md:text-2xl text-slate-600 leading-relaxed max-w-4xl">
            VirtuLab Africa is a transformative platform bringing practical science education to learners across Kenya and beyond. By providing realistic virtual laboratory experiments on smartphones and school computers, we ensure that students in resource-limited schools can experience hands-on science safely and effectively.
          </p>
        </div>

        {/* Our Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
          <div className="col-span-full mb-4">
            <h3 className="text-2xl font-black text-[#1e293b] uppercase tracking-widest border-l-4 border-[#249e91] pl-4">Our Impact</h3>
          </div>
          {[
            { 
              icon: <Zap className="text-yellow-500 w-8 h-8 md:w-10 md:h-10" />, 
              title: "Breaking Barriers", 
              desc: "Providing science education for learners with limited access to physical laboratory equipment." 
            },
            { 
              icon: <ShieldCheck className="text-emerald-500 w-8 h-8 md:w-10 md:h-10" />, 
              title: "Safe Exploration", 
              desc: "Allowing students to perform experiments safely, explore concepts, and build practical skills." 
            },
            { 
              icon: <Activity className="text-blue-500 w-8 h-8 md:w-10 md:h-10" />, 
              title: "Confidence & Understanding", 
              desc: "Strengthening learners’ understanding in Biology, Chemistry, and Physics practicals." 
            },
            { 
              icon: <Award className="text-purple-500 w-8 h-8 md:w-10 md:h-10" />, 
              title: "Future Ready", 
              desc: "Preparing students for national examinations and inspiring future scientific careers." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-8 items-start transition-transform hover:-translate-y-2">
              <div className="p-5 bg-slate-50 rounded-2xl flex-shrink-0">{item.icon}</div>
              <div>
                <h4 className="text-2xl font-black text-slate-800 mb-4">{item.title}</h4>
                <p className="text-slate-600 text-lg leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Student Stories - Styled with Who We Serve colors */}
        <div className="mb-24 bg-[#249e91] rounded-[3rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-40 -mt-40 blur-[100px]" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-12 uppercase tracking-widest border-l-4 border-white pl-4">Student Stories</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-8">
                <h4 className="text-4xl md:text-5xl font-black leading-tight">Learner Story: Evans Ebukoro Odera</h4>
                <p className="text-white/90 leading-relaxed italic border-l-2 border-white/30 pl-6 text-xl md:text-2xl">
                  "Evans Ebukoro Odera is a 17-year-old secondary school student from Osiputa Village in Teso South, Busia County. He studies at St. Peter’s Aterait Secondary School and dreams of becoming a medical doctor."
                </p>
                <p className="text-white/80 leading-relaxed text-lg">
                  Like many learners in rural Kenya, Evans faced serious challenges in learning science due to limited access to functional laboratory equipment. Most practical lessons were either skipped or taught theoretically because of broken apparatus, lack of chemicals, and safety concerns.
                </p>
                <div className="bg-white/10 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-sm">
                  <h5 className="font-black text-white mb-4 flex items-center gap-3 text-xl"><Sparkles className="w-6 h-6" /> How VirtuLab Africa Helped</h5>
                  <p className="text-white/90 leading-relaxed text-base md:text-lg">
                    Through realistic virtual experiments that run on a smartphone or school computer, Evans can now safely perform experiments, repeat them, explore concepts, and test ideas just like in a real laboratory. AI-guided simulations help him build real practical skills, strengthen his understanding, and prepare better for national examinations.
                  </p>
                </div>
                <p className="text-white font-bold text-xl leading-relaxed">
                  With VirtuLab Africa, Evans is no longer limited by lack of infrastructure. He now has equal access to practical science education, making his journey toward becoming a medical doctor clearer, more achievable, and more inspiring.
                </p>
              </div>
              <div className="lg:col-span-5 w-full">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-white/10 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20 relative">
                    <img 
                      src={STUDENT_IMG} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt="Evans Ebukoro Odera" 
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#122b31]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="font-black text-2xl">Evans Ebukoro Odera</p>
                    <p className="text-sm uppercase font-bold tracking-widest text-white/70">Aspiring Medical Doctor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why We Built This */}
        <div className="mb-24 text-center max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-black text-[#1e293b] mb-10 uppercase tracking-widest">Why We Built This</h3>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed">
            VirtuLab Africa was founded to bridge the gap between theoretical knowledge and practical skills in science education. Many students in rural Kenya have the passion to learn, but lack the tools and resources to gain real-world experience. We aim to empower learners like Evans to dream big, experiment freely, and achieve their academic and career goals.
          </p>
        </div>

        {/* Our Visionaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="col-span-full mb-4">
            <h3 className="text-2xl font-black text-[#1e293b] uppercase tracking-widest border-l-4 border-[#249e91] pl-4">Our Visionaries</h3>
          </div>
          {[
            {
               name: "Emma Muthoni",
               role: "Founder",
               desc: "Visionary leader and education advocate who created VirtuLab Africa to make practical science accessible to all students.",
               avatar: "/team/emma-muthoni.jpeg"},
            {
              name: "Pauline Nafuna",
              role: "Software Engineer",
              desc: "Lead software engineer who develops the AI-guided simulations and ensures a seamless, engaging, and safe virtual laboratory experience.",
              avatar: "/team/pauline-nafuna.jpeg"
            }
          ].map((founder, idx) => (
            <div key={idx} className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-40 h-40 rounded-full border-8 border-slate-50 mb-8 overflow-hidden transition-transform group-hover:scale-105 shadow-inner">
                <img src={founder.avatar} alt={founder.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-3xl font-black text-slate-800 mb-2">{founder.name}</h4>
              <p className="text-[#249e91] font-black text-sm uppercase tracking-widest mb-6">{founder.role}</p>
              <p className="text-slate-500 text-lg leading-relaxed">{founder.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Custom Background Icons ---
const DnaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 50 0 Q 80 50 50 100 Q 20 150 50 200" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M 50 0 Q 20 50 50 100 Q 80 150 50 200" fill="none" stroke="currentColor" strokeWidth="2" />
    {[10, 30, 50, 70, 90].map(y => (
      <line key={y} x1="35" y1={y} x2="65" y2={y} stroke="currentColor" strokeWidth="1" />
    ))}
  </svg>
);

const MoleculeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <circle cx="50" cy="50" r="12" />
    <circle cx="20" cy="20" r="8" />
    <circle cx="80" cy="20" r="8" />
    <circle cx="50" cy="85" r="8" />
    <line x1="50" y1="50" x2="20" y2="20" stroke="currentColor" strokeWidth="4" />
    <line x1="50" y1="50" x2="80" y2="20" stroke="currentColor" strokeWidth="4" />
    <line x1="50" y1="50" x2="50" y2="85" stroke="currentColor" strokeWidth="4" />
  </svg>
);

// --- Accessibility Styles Wrapper ---
const AccessibilityWrapper = ({ children }: { children: React.ReactNode }) => {
  const { accessibility } = useAppState();
  
  const accessibilityStyles = useMemo(() => {
    let styles = "";
    if (accessibility.highContrast) {
      styles += `
        .acc-root { 
          --bg-primary: #000000 !important;
          --text-primary: #ffffff !important;
          --accent-primary: #00ffff !important;
          filter: contrast(1.5) saturate(0);
        }
      `;
    }
    if (accessibility.fontSize === 1) {
      styles += " .acc-root { font-size: 1.25rem !important; } ";
    } else if (accessibility.fontSize === 2) {
      styles += " .acc-root { font-size: 1.5rem !important; } ";
    }
    if (accessibility.dyslexicFont) {
      styles += `
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/OpenDyslexic-Regular.otf');
        }
        .acc-root { font-family: 'OpenDyslexic', sans-serif !important; }
      `;
    }
    if (accessibility.reducedMotion) {
      styles += " .acc-root * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; } ";
    }
    if (accessibility.largeTargets) {
      styles += " .acc-root button, .acc-root a, .acc-root input { min-width: 48px !important; min-height: 48px !important; padding: 1.5rem !important; } ";
    }
    return styles;
  }, [accessibility]);

  return (
    <div className={`acc-root min-h-screen transition-all ${accessibility.highContrast ? 'bg-black text-white' : ''}`}>
      <style>{accessibilityStyles}</style>
      {children}
    </div>
  );
};

// --- Welcome Flow ---

const WelcomeFlow = ({ onComplete }: { onComplete: (userData: { name: string; avatar: string }) => void }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (name && selectedAvatar) {
      onComplete({ name, avatar: selectedAvatar });
    }
  };

  const avatarOptions = [
    { id: AVATARS[0], label: 'Scientist 1' },
    { id: AVATARS[1], label: 'Scientist 2' },
    { id: AVATARS[2], label: 'Scientist 3' },
    { id: AVATARS[3] || AVATARS[0], label: 'Scientist 4' },
  ];

  const steps = [
    // Step 1: Welcome Screen
    <div key="welcome" className="text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-5xl">🎉</div>
        <h2 className="text-3xl font-black text-[#1e293b]">Welcome, Scientist! <span className="text-2xl">👩‍🔬🧑‍🔬</span></h2>
        <p className="text-lg text-gray-600">Ready to explore, experiment, and discover amazing things?</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="mt-6 px-8 py-4 bg-[#249e91] text-white rounded-2xl font-black text-lg flex items-center gap-2 mx-auto animate-pulse"
        >
          🚀 Let's Start
        </motion.button>
      </motion.div>
    </div>,
    
    // Step 2: Name Input
    <motion.div 
      key="name-input"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 w-full"
    >
      <div className="text-4xl mb-4">🧠</div>
      <h2 className="text-2xl font-bold text-[#1e293b]">What's your name, Scientist?</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Evans"
        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#249e91] focus:border-transparent"
        autoFocus
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        disabled={!name.trim()}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 ${
          name.trim() ? 'bg-[#249e91] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>,
    
    // Step 3: Personalized Welcome
    <motion.div 
      key="personalized"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="text-6xl mb-4">🌟</div>
      <h2 className="text-3xl font-black text-[#1e293b]">
        Welcome, Scientist {name}!
      </h2>
      <p className="text-lg text-gray-600">Your virtual lab adventure is about to begin!</p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="mt-4 px-8 py-4 bg-[#249e91] text-white rounded-2xl font-black text-lg"
      >
        Continue
      </motion.button>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 text-2xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </motion.div>,
    
    // Step 4: Avatar Selection
    <motion.div 
      key="avatar-selection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-[#1e293b]">🧪 Choose Your Scientist Avatar</h2>
      <div className="grid grid-cols-2 gap-4">
        {avatarOptions.map((avatar, index) => (
          <motion.div
            key={avatar.id}
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAvatar(avatar.id)}
            className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center space-y-2 ${
              selectedAvatar === avatar.id 
                ? 'border-[#249e91] bg-[#e6f7f5]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              <img 
                src={avatar.id} 
                alt={avatar.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = AVATARS[index % AVATARS.length];
                }}
              />
            </div>
            <span className="text-sm font-medium">{avatar.label}</span>
            {selectedAvatar === avatar.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-500"
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        disabled={!selectedAvatar}
        className={`w-full py-4 rounded-2xl font-bold text-lg mt-4 ${
          selectedAvatar ? 'bg-[#249e91] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Confirm Selection
      </motion.button>
    </motion.div>,
    
    // Step 5: Final Confirmation
    <motion.div 
      key="final-confirmation"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="text-6xl">🧬</div>
      <h2 className="text-3xl font-black text-[#1e293b]">
        Awesome, Scientist {name}!
      </h2>
      <p className="text-lg text-gray-600">Let's start your science adventure! 🔬🧪</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        className="mt-4 px-8 py-4 bg-gradient-to-r from-[#249e91] to-[#1a7a73] text-white rounded-2xl font-black text-lg shadow-lg"
      >
        Enter Lab 🚀
      </motion.button>
    </motion.div>
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <motion.div
          className="absolute -top-16 -left-20 text-cyan-300/50"
          animate={{ y: [0, 18, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <DnaIcon className="w-56 h-56" />
        </motion.div>
        <motion.div
          className="absolute top-24 -right-20 text-purple-300/50"
          animate={{ y: [0, -14, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MoleculeIcon className="w-52 h-52" />
        </motion.div>
        <motion.div
          className="absolute bottom-10 -right-24 text-cyan-200/40"
          animate={{ y: [0, 16, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <DnaIcon className="w-64 h-64" />
        </motion.div>
        <motion.div
          className="absolute -bottom-24 left-10 text-purple-200/40"
          animate={{ y: [0, -12, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MoleculeIcon className="w-60 h-60" />
        </motion.div>
        <motion.div
          className="absolute top-[42%] left-[10%] w-56 h-56 rounded-full border border-cyan-200/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-[42%] left-[10%] w-56 h-56 rounded-full border border-purple-200/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        />
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/50"
            style={{
              width: 10 + ((i * 7) % 18),
              height: 10 + ((i * 7) % 18),
              top: `${(i * 13) % 100}%`,
              left: `${(i * 17) % 100}%`,
            }}
            animate={{
              y: [0, (i % 2 === 0 ? -18 : 18), 0],
              x: [0, (i % 3 === 0 ? 10 : -10), 0],
              opacity: [0.15, 0.5, 0.15],
            }}
            transition={{
              duration: 8 + (i % 5),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i % 7) * 0.2,
            }}
          />
        ))}
        <motion.div
          className="absolute bottom-10 left-8 text-slate-400/20 font-mono font-black text-4xl"
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          E = mc²
        </motion.div>
        <motion.div
          className="absolute bottom-24 right-10 text-slate-400/15 font-mono font-black text-2xl"
          animate={{ opacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          H₂O + CO₂ → C₆H₁₂O₆
        </motion.div>
        <motion.div
          className="absolute top-14 left-10 text-slate-400/15 font-mono font-black text-2xl"
          animate={{ opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          F = ma
        </motion.div>
      </div>
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Floating particles background */}
        <div className="absolute inset-0 -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-100"
              style={{
                width: Math.random() * 20 + 5,
                height: Math.random() * 20 + 5,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- App Shell ---

const AppStateProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [view, setView] = useState<AppView>('landing');
  const [profile, setProfile] = useState<UserProfile>(() => { const s = localStorage.getItem('virtulab_profile'); return s ? JSON.parse(s) : { name: '', avatar: AVATARS[0], xp: 2450, streak: 5, badges: ['First Step'] }; });
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({ 
    highContrast: false, 
    fontSize: 0, 
    dyslexicFont: false,
    reducedMotion: false,
    largeTargets: false,
    audioCues: false
  });
  useEffect(() => { localStorage.setItem('virtulab_profile', JSON.stringify(profile)); }, [profile]);
  return <AppStateContext.Provider value={{ profile, setProfile, view, setView, accessibility, setAccessibility }}>{children}</AppStateContext.Provider>;
};

const ViewportManager = () => {
  const { view, profile, setView, setProfile } = useAppState();
  const [activeExp, setActiveExp] = useState<any>(null);

  const handleWelcomeComplete = (userData: { name: string; avatar: string }) => {
    setProfile({
      ...profile,
      name: userData.name,
      avatar: userData.avatar,
      xp: 0,
      streak: 0,
      badges: []
    });
    setView('selection');
  };

  if (view === 'onboarding') {
    return (
      <WelcomeFlow 
        onComplete={handleWelcomeComplete}
      />
    );
  }

  return (
    <AccessibilityWrapper>
      <Navbar />
      <main>
        {view === 'landing' && <Landing onStartLearning={() => setView('onboarding')} />}
        {view === 'selection' && <Selection onExperimentSelect={setActiveExp} />}
        {view === 'about' && <AboutSection />}
        {view === 'lab' && activeExp && (
          <LabBench 
            experiment={activeExp} 
            user={profile} 
            onComplete={(xp) => {
              setProfile(prev => ({
                ...prev,
                xp: (prev.xp || 0) + xp,
              }));
              setView('selection');
            }} 
          />
        )}
      </main>
    </AccessibilityWrapper>
  );
};

const App = () => (<AppStateProvider><ViewportManager /></AppStateProvider>);
const root = createRoot(document.getElementById('root')!);
root.render(<App />);