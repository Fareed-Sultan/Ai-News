"use client";

import { RefreshCw, Radio, Sparkles } from "lucide-react";

export default function LiveStatusBar({
  title,
  lastUpdated,
  status,
  onRefresh,
  articleCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
      {/* Title with Sharp Accent Bar */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-6 sm:h-7 rounded-full bg-gradient-to-b from-[#FF1053] via-[#0066FF] to-[#00E5FF] shadow-sm" aria-hidden />
        <h1 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight uppercase">
          {title}
        </h1>
        {articleCount > 0 && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-white/10 shadow-2xs">
            {articleCount} Stories
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button
          onClick={onRefresh}
          disabled={status === "refreshing" || status === "loading"}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200/90 dark:border-white/10 transition-all disabled:opacity-60 shadow-xs active:scale-95"
        >
          <RefreshCw
            size={13}
            className={status === "refreshing" || status === "loading" ? "animate-spin text-[#0066FF]" : "text-slate-400"}
          />
          <span>
            {lastUpdated
              ? `Synced ${lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}`
              : "Syncing Feed"}
          </span>
        </button>
      </div>
    </div>
  );
}
