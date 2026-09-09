"use client";

import { useState } from "react";
import { X, Tv, Sparkles, Radio, Volume2, VolumeX, Copy, Check, ExternalLink } from "lucide-react";

export default function AIResultsPanel({ result, onClose }) {
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result || result.isGreeting) return null;

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.answer);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-[#0066FF]/40 dark:border-[#0066FF]/30 bg-white dark:bg-[#0B1120] shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#060913] via-[#0B1120] to-[#141E33] text-white px-5 py-3.5 flex items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF1053] via-[#0066FF] to-[#00E5FF] p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
              <Sparkles size={16} className="text-[#FFB703]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-black text-base tracking-wide uppercase">
                Pulse AI News Intelligence
              </p>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FF1053] text-white uppercase shadow-sm">
                Verified Briefing
              </span>
            </div>
            <p className="text-[11px] text-slate-300/80 font-medium">Topic: "{result.query}"</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSpeak}
            title={speaking ? "Stop Audio" : "Listen to Briefing"}
            className={`p-1.5 rounded-lg border border-white/10 hover:bg-white/20 transition-colors ${
              speaking ? "text-[#0066FF] bg-white/20 animate-pulse" : "text-slate-300"
            }`}
          >
            {speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={handleCopy}
            title="Copy briefing"
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check size={15} className="text-[#00E599]" /> : <Copy size={15} />}
          </button>

          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            aria-label="Close AI results"
            className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-1.5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-4">
        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-line">
          {result.answer}
        </p>

        {/* Attached Videos */}
        {result.videos?.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08]">
            <p className="text-xs font-black text-[#FF1053] dark:text-[#FF1053] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1053] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1053]"></span>
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
                  <div className="w-48 sm:w-56 h-32 rounded-xl overflow-hidden bg-slate-900 relative border border-slate-200/80 dark:border-white/10 shadow-sm group-hover:shadow-md group-hover:border-[#0066FF]/60 transition-all">
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
                      <span className="w-8 h-8 rounded-full bg-[#FF1053] text-white flex items-center justify-center text-xs shadow-lg group-hover:scale-110 transition-transform">
                        ▶
                      </span>
                    </span>
                    {v.channel && (
                      <span className="absolute bottom-2 left-2 bg-black/90 text-white text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide truncate max-w-[85%] shadow-sm">
                        {v.channel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-snug mt-2 line-clamp-2 group-hover:text-[#0066FF] dark:group-hover:text-[#00E5FF] transition-colors">
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
