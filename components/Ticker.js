"use client";

import { Zap, Radio } from "lucide-react";

export default function Ticker({ articles }) {
  if (!articles || articles.length === 0) return null;

  const headlines = articles.slice(0, 10).map((a) => a.title);
  // duplicate the list so the CSS animation loops seamlessly
  const loop = [...headlines, ...headlines];

  return (
    <div className="w-full bg-[#080C14] text-white overflow-hidden select-none border-b border-white/[0.08] relative z-30 shadow-md">
      <div className="flex items-center">
        {/* Sharp Breaking Badge */}
        <div className="flex items-center gap-2 shrink-0 bg-gradient-to-r from-rose-600 to-rose-700 text-white px-3 sm:px-4 py-2 font-display text-[11px] sm:text-xs font-black uppercase tracking-wider z-10 shadow-lg border-r border-rose-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="flex items-center gap-1">
            <Zap size={13} className="fill-amber-300 text-amber-300" />
            BREAKING NEWS
          </span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="relative flex-1 overflow-hidden py-1.5 group">
          <div className="flex whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]">
            {loop.map((headline, i) => (
              <span
                key={i}
                className="mx-5 text-xs sm:text-sm font-medium tracking-wide text-slate-200 hover:text-white transition-colors cursor-default inline-flex items-center"
              >
                {headline}
                <span className="ml-5 text-rose-500 font-extrabold text-base leading-none">
                  ✦
                </span>
              </span>
            ))}
          </div>
          {/* Subtle edge fades */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#080C14] to-transparent z-10" />
        </div>
      </div>
    </div>
  );
}

