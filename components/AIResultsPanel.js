"use client";

import { X, Tv, Sparkles, Radio } from "lucide-react";

export default function AIResultsPanel({ result, onClose }) {
  if (!result || result.isGreeting) return null;

  return (
    <div className="mb-8 rounded-2xl border border-blue-500/30 dark:border-blue-400/20 bg-white dark:bg-[#0D1527] shadow-lg dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#080C14] via-[#0F172A] to-[#1E293B] text-white px-5 py-3.5 flex items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-blue-600 p-0.5 flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-extrabold text-base tracking-wide uppercase">
                Pulse AI News Intelligence
              </p>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase">
                Live Briefing
              </span>
            </div>
            <p className="text-[11px] text-slate-300/80 font-medium">Topic: "{result.query}"</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI results"
          className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-4">
        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-line">
          {result.answer}
        </p>

        {result.videos?.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08]">
            <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              Verified TV Broadcast Feeds & Video Reports
            </p>
            <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
              {result.videos.slice(0, 10).map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 w-48 sm:w-56 group"
                >
                  <div className="w-48 sm:w-56 h-32 rounded-xl overflow-hidden bg-slate-900 relative border border-slate-200/80 dark:border-white/10 shadow-sm group-hover:shadow-md transition-all">
                    {v.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                      <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-lg group-hover:scale-110 transition-transform">
                        ▶
                      </span>
                    </span>
                    {v.channel && (
                      <span className="absolute bottom-2 left-2 bg-black/90 text-white text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide truncate max-w-[85%] shadow-sm">
                        {v.channel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug mt-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {v.title}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

