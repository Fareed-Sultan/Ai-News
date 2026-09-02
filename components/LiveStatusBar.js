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
        <span className="w-1.5 h-6 sm:h-7 rounded-full bg-gradient-to-b from-rose-600 via-blue-600 to-amber-500 shadow-sm" aria-hidden />
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight uppercase">
          {title}
        </h1>
        {articleCount > 0 && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300">
            {articleCount} Stories
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button
          onClick={onRefresh}
          disabled={status === "refreshing" || status === "loading"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-all disabled:opacity-60 shadow-xs"
        >
          <RefreshCw
            size={13}
            className={status === "refreshing" || status === "loading" ? "animate-spin text-blue-500" : "text-slate-400"}
          />
          <span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], {
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

