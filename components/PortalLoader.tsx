"use client";

import React from "react";

export function PortalLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 font-sans select-none overflow-hidden">
      <style>{`
        @keyframes scaleLogo {
          0% {
            transform: scale(0.2);
            opacity: 0;
            filter: blur(12px);
          }
          40% {
            transform: scale(1.15);
            opacity: 0.9;
            filter: blur(0);
          }
          70% {
            transform: scale(0.95);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes scaleText {
          0% {
            transform: scale(0.5);
            opacity: 0;
            letter-spacing: -0.1em;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
            letter-spacing: 0.1em;
          }
          100% {
            transform: scale(1);
            opacity: 1;
            letter-spacing: 0.25em;
          }
        }
        @keyframes bgGlow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.25;
          }
        }
        .animate-logo-scale {
          animation: scaleLogo 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-text-scale {
          animation: scaleText 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-bg-glow {
          animation: bgGlow 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* High-fidelity ambient background blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none animate-bg-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none animate-bg-glow" style={{ animationDelay: "-0.6s" }} />

      {/* Giant scaling lightning logo container */}
      <div className="relative mb-8 flex items-center justify-center animate-logo-scale">
        <div className="absolute w-36 h-36 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
        <div className="relative h-28 w-28 rounded-[24px] bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-6xl shadow-2xl shadow-cyan-500/40">
          ⚡
        </div>
      </div>

      {/* Giant scaling text */}
      <h2 className="animate-text-scale text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-400 bg-clip-text text-transparent uppercase text-center leading-none">
        PrepPath
      </h2>
    </div>
  );
}
