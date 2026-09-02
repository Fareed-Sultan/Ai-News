"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  Tv,
  Zap,
  TrendingUp,
  Globe2,
  Radio,
} from "lucide-react";
import { proxiedImage } from "@/lib/imageProxy";

const QUICK_PROMPTS = [
  { label: "⚡ Top Breaking News", query: "Give me the latest breaking headlines right now" },
  { label: "📈 Markets & Tech", query: "What are the latest tech and market news?" },
  { label: "🏏 Sports Updates", query: "Latest sports scores and updates" },
  { label: "🌍 World News", query: "Global world news summary today" },
];

export default function ChatWidget({ country = "pk", onResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Welcome to Pulse AI Intelligence. I monitor global wires and live TV news broadcasts 24/7. What topic would you like summarized?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const handleSend = async (queryText) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, country }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.error || "Unable to retrieve live summary, please try again." },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer,
          videos: data.videos || [],
        },
      ]);

      onResult?.({
        query: text,
        answer: data.answer,
        videos: data.videos || [],
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Network connection lost — please try again." },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      {/* Glowing FAB Launcher */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI Assistant" : "Open Live AI News Assistant"}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-rose-600 to-blue-600 text-white rounded-full px-4 py-3.5 shadow-2xl hover:shadow-glow-red transition-all border border-white/20"
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            <Sparkles size={18} className="text-amber-300 fill-amber-300/30" />
            <span className="font-display font-bold text-xs uppercase tracking-wider hidden sm:inline">
              Ask AI News
            </span>
          </>
        )}
      </motion.button>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[75vh] max-h-[600px] bg-white/95 dark:bg-[#090E1A]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#080C14] via-[#0F172A] to-[#1E293B] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-blue-600 p-0.5 flex items-center justify-center shadow-sm">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles size={15} className="text-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-display font-extrabold text-sm uppercase tracking-wide">Pulse AI Intelligence</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-medium text-slate-400">Live TV Broadcasts & Global Wire Synthesis</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-black/20 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-white/[0.08] hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-white/10 transition-all whitespace-nowrap shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3.5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-md font-medium"
                        : "bg-slate-100 dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-white/[0.08] shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Attached TV News Channel Broadcasts */}
                    {m.videos?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                        <p className="text-[10px] font-extrabold tracking-wider uppercase text-rose-600 dark:text-rose-400 mb-2.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          Verified TV News Broadcasts
                        </p>
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                          {m.videos.slice(0, 8).map((v) => (
                            <a
                              key={v.id}
                              href={v.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 w-36 group"
                            >
                              <div className="w-36 h-20 rounded-xl overflow-hidden bg-slate-900 relative border border-slate-200/60 dark:border-white/10 shadow-sm">
                                {v.thumbnail && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={v.thumbnail}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                  />
                                )}
                                <span className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow-md group-hover:scale-110 transition-transform">
                                    ▶
                                  </span>
                                </span>
                                {v.channel && (
                                  <span className="absolute bottom-1 left-1 bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold truncate max-w-[90%]">
                                    {v.channel}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-tight mt-1.5 line-clamp-2 font-semibold group-hover:text-blue-500 transition-colors">
                                {v.title}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl rounded-bl-xs px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                    <Loader2 size={15} className="animate-spin text-rose-500" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Synthesizing live news feeds & broadcasts...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#080C14] flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about breaking world events, sports, tech..."
                className="flex-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none border border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="bg-gradient-to-r from-rose-600 to-blue-600 hover:from-rose-500 hover:to-blue-500 text-white rounded-xl p-2.5 disabled:opacity-40 shadow-sm transition-all"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}