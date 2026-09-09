"use client";

import { Zap, Flame } from "lucide-react";

export default function Ticker({ articles }) {
  if (!articles || articles.length === 0) return null;

  const headlines = articles.slice(0, 10).map((a) => a.title);
  const loop = [...headlines, ...headlines];

  return (
    <div className="w-full bg-[#060913] text-white overflow-hidden select-none border-b border-white/[0.1] relative z-30 shadow-md">
      <div className="flex items-center">
        {/* Sharp Breaking Badge */}
        <div className="flex items-center gap-2 shrink-0 bg-gradient-to-r from-[#FF1053] to-[#E11D48] text-white px-3.5 sm:px-4 py-2 font-display text-[11px] sm:text-xs font-black uppercase tracking-wider z-10 shadow-glow-crimson border-r border-[#FF1053]/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={13} className="fill-[#FFB703] text-[#FFB703]" />
            BREAKING NEWS
          </span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="relative flex-1 overflow-hidden py-1.5 group">
          <div className="flex whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]">
            {loop.map((headline, i) => (
              <span
                key={i}
                className="mx-5 text-xs sm:text-sm font-semibold tracking-wide text-slate-200 hover:text-white transition-colors cursor-default inline-flex items-center"
              >
                {headline}
                <span className="ml-5 text-[#FF1053] font-black text-base leading-none">
                  ✦
                </span>
              </span>
            ))}
          </div>
          {/* Subtle edge fades */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#060913] to-transparent z-10" />
        </div>
      </div>
    </div>
  );
}
