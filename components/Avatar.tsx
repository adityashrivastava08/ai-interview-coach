import React from "react";

export interface AvatarPreset {
  id: string;
  name: string;
  gradient: string;
  svg: React.ReactNode;
}

export const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: "avatar-prodigy",
    name: "Tech Prodigy",
    gradient: "from-indigo-500 to-purple-600",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-prodigy)" />
        <circle cx="50" cy="42" r="18" fill="white" fillOpacity="0.85" />
        <path d="M22 80 C22 62 78 62 78 80" fill="white" fillOpacity="0.75" />
        <circle cx="42" cy="42" r="5" stroke="#4f46e5" strokeWidth="2.5" />
        <circle cx="58" cy="42" r="5" stroke="#4f46e5" strokeWidth="2.5" />
        <path d="M47 42 H53" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M45 52 C48 54 52 54 55 52" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="grad-prodigy" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar-warrior",
    name: "Code Warrior",
    gradient: "from-teal-500 to-emerald-600",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-warrior)" />
        <circle cx="50" cy="45" r="18" fill="white" fillOpacity="0.9" />
        <path d="M22 82 C22 64 78 64 78 82" fill="white" fillOpacity="0.8" />
        <path d="M30 38 C30 25 70 25 70 38 H30 Z" fill="#0d9488" />
        <rect x="27" y="36" width="46" height="5" rx="2.5" fill="#0f766e" />
        <circle cx="50" cy="22" r="4" fill="#0f766e" />
        <defs>
          <linearGradient id="grad-warrior" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar-wizard",
    name: "Data Wizard",
    gradient: "from-purple-500 to-pink-600",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-wizard)" />
        <circle cx="50" cy="45" r="18" fill="white" fillOpacity="0.9" />
        <path d="M22 82 C22 64 78 64 78 82" fill="white" fillOpacity="0.8" />
        <rect x="27" y="38" width="6" height="14" rx="3" fill="#1e1b4b" />
        <rect x="67" y="38" width="6" height="14" rx="3" fill="#1e1b4b" />
        <path d="M30 40 C30 22 70 22 70 40" stroke="#1e1b4b" strokeWidth="4" fill="none" />
        <defs>
          <linearGradient id="grad-wizard" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar-ace",
    name: "Placement Ace",
    gradient: "from-orange-500 to-amber-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-ace)" />
        <path d="M50 20 C60 40 60 65 58 75 H42 C40 65 40 40 50 20 Z" fill="white" />
        <path d="M50 20 C45 40 45 65 42 75 H50 Z" fill="#e2e8f0" />
        <circle cx="50" cy="40" r="4" fill="#ea580c" />
        <path d="M42 60 L32 75 H42 Z" fill="#ea580c" />
        <path d="M58 60 L68 75 H58 Z" fill="#ea580c" />
        <path d="M46 78 L50 90 L54 78 Z" fill="#f59e0b" />
        <defs>
          <linearGradient id="grad-ace" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar-designer",
    name: "Creative Mind",
    gradient: "from-pink-500 to-rose-600",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-designer)" />
        <circle cx="40" cy="40" r="22" fill="#3b82f6" fillOpacity="0.8" />
        <circle cx="60" cy="45" r="22" fill="#ec4899" fillOpacity="0.8" />
        <circle cx="50" cy="62" r="20" fill="#10b981" fillOpacity="0.8" />
        <defs>
          <linearGradient id="grad-designer" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar-guardian",
    name: "Cyber Sentinel",
    gradient: "from-slate-500 to-zinc-800",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-guardian)" />
        <path d="M30 30 C40 30 50 25 50 25 C50 25 60 30 70 30 V55 C70 68 50 78 50 78 C50 78 30 68 30 55 V30 Z" fill="white" fillOpacity="0.9" />
        <rect x="42" y="48" width="16" height="12" rx="2" fill="#475569" />
        <path d="M45 48 V44 C45 40 55 40 55 44 V48" stroke="#475569" strokeWidth="2.5" fill="none" />
        <defs>
          <linearGradient id="grad-guardian" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar-master",
    name: "System Architect",
    gradient: "from-cyan-500 to-sky-600",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-master)" />
        <circle cx="50" cy="50" r="10" fill="white" />
        <circle cx="28" cy="35" r="7" fill="white" fillOpacity="0.8" />
        <circle cx="72" cy="35" r="7" fill="white" fillOpacity="0.8" />
        <circle cx="28" cy="65" r="7" fill="white" fillOpacity="0.8" />
        <circle cx="72" cy="65" r="7" fill="white" fillOpacity="0.8" />
        <line x1="50" y1="50" x2="28" y2="35" stroke="white" strokeWidth="2.5" strokeDasharray="3 3" />
        <line x1="50" y1="50" x2="72" y2="35" stroke="white" strokeWidth="2.5" strokeDasharray="3 3" />
        <line x1="50" y1="50" x2="28" y2="65" stroke="white" strokeWidth="2.5" strokeDasharray="3 3" />
        <line x1="50" y1="50" x2="72" y2="65" stroke="white" strokeWidth="2.5" strokeDasharray="3 3" />
        <defs>
          <linearGradient id="grad-master" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar-champ",
    name: "Placement Leader",
    gradient: "from-yellow-450 to-amber-600",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="100" height="100" rx="30" fill="url(#grad-champ)" />
        <path d="M50 20 L58 38 L78 40 L62 53 L67 72 L50 62 L33 72 L38 53 L22 40 L42 38 Z" fill="white" />
        <circle cx="50" cy="46" r="6" fill="#ca8a04" />
        <defs>
          <linearGradient id="grad-champ" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
      </svg>
    )
  }
];

interface UserAvatarProps {
  avatarUrl?: string;
  name?: string;
  className?: string;
}

export function UserAvatar({ avatarUrl, name, className = "h-8 w-8" }: UserAvatarProps) {
  const preset = PRESET_AVATARS.find((av) => av.id === avatarUrl);
  
  if (preset) {
    return <div className={`${className} flex-shrink-0 select-none`}>{preset.svg}</div>;
  }

  if (avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"))) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User Profile"}
        className={`${className} rounded-xl object-cover flex-shrink-0 select-none border border-slate-200 dark:border-slate-800`}
      />
    );
  }

  // Fallback to beautiful initial-based avatar
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PP";

  return (
    <div
      className={`${className} flex-shrink-0 select-none rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm`}
    >
      {initials}
    </div>
  );
}
