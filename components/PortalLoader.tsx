"use client";

import React from "react";

export function PortalLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background font-sans select-none overflow-hidden">
      <style>{`
        @keyframes lineLoad {
          0% {
            width: 0%;
            opacity: 0.8;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
        @keyframes textFade {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-line {
          animation: lineLoad 1.5s cubic-bezier(0.65, 0.05, 0.36, 1) infinite;
        }
        .animate-text-fade {
          animation: textFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="text-center space-y-4">
        {/* Typographic Serif wordmark */}
        <h2 className="animate-text-fade text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground text-center">
          PrepPath
        </h2>
        
        {/* Subtle, thin progress track and loader */}
        <div className="relative w-44 h-[1px] bg-border mx-auto overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-primary animate-line" />
        </div>

        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono font-medium animate-pulse pt-2">
          Accessing Sandbox
        </p>
      </div>
    </div>
  );
}

