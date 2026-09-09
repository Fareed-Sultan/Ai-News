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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Flame,
} from "lucide-react";

const QUICK_PROMPTS = [
  { label: "⚡ Breaking Headlines", query: "Give me the latest breaking news headlines right now" },
  { label: "🕒 9 PM Bulletin", query: "Pakistan 9 PM TV news bulletin summary" },
  { label: "📈 Markets & Tech", query: "What are the latest global tech and market updates?" },
  { label: "🏏 Sports & Cricket", query: "Latest cricket match and sports updates" },
  { label: "🌍 World News", query: "Global world headlines and international coverage" },
];

export default function ChatWidget({ country = "pk", onResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Welcome to Pulse AI News Intelligence. I monitor global wire syndicates and verified live TV broadcasts 24/7. Ask about any breaking event, specific bulletin time (e.g. '9 PM news'), or regional coverage.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
            handleSend(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else {
      // Stop speech synthesis if closed
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
      }
    }
  }, [isOpen]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (text, index) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setMessages([
      {
        role: "bot",
        text: "Pulse AI Intelligence reset. Ask me anything about breaking events, bulletins, or world stories!",
      },
    ]);
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const handleSend = async (queryText) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    // Stop speaking if new query sent
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }

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
          articles: data.articles || [],
          timeSlot: data.timeSlot,
          date: data.date,
        },
      ]);

      onResult?.({
        query: text,
        answer: data.answer,
        videos: data.videos || [],
        articles: data.articles || [],
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Network connection issue — please try again." },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      {/* Sharp Radiant Floating Button Launcher */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI Assistant" : "Open Live AI News Intelligence Assistant"}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-[#FF1053] via-[#E11D48] to-[#0066FF] text-white rounded-full px-5 py-3.5 shadow-glow-crimson hover:shadow-glow-blue transition-all border border-white/30"
      >
        {isOpen ? (
          <X size={20} className="stroke-[2.5]" />
        ) : (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFB703] shadow-sm"></span>
            </span>
            <Sparkles size={18} className="text-[#FFB703] fill-[#FFB703]/30 animate-pulse" />
            <span className="font-display font-black text-xs uppercase tracking-wider hidden sm:inline">
              AI News Agent
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
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[78vh] max-h-[640px] bg-white/95 dark:bg-[#060913]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/15 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#060913] via-[#0B1120] to-[#141E33] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF1053] via-[#0066FF] to-[#00E5FF] p-0.5 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
                    <Sparkles size={15} className="text-[#FFB703]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-display font-black text-sm uppercase tracking-wide">Pulse AI Intelligence</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">Live TV Broadcasts & News Wire Synthesis</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset chat"
                  className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-black/40 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-white/[0.08] hover:bg-rose-50 dark:hover:bg-[#FF1053]/20 text-slate-700 dark:text-slate-200 hover:text-[#FF1053] dark:hover:text-[#FF1053] border border-slate-200/90 dark:border-white/10 transition-all whitespace-nowrap shadow-2xs active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-br-xs shadow-md font-medium"
                        : "bg-slate-100/95 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/90 dark:border-white/[0.1] shadow-sm"
                    }`}
                  >
                    {/* Header bar for bot messages: Time/Slot tag + audio/copy actions */}
                    {m.role === "bot" && i > 0 && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/10 text-[10px] font-bold">
                        <span className="text-[#FF1053] dark:text-[#FF1053] uppercase tracking-wider flex items-center gap-1">
                          <Zap size={11} className="fill-current" />
                          {m.timeSlot ? `${m.timeSlot} Bulletin` : "Intelligence Report"}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Audio Listen Button */}
                          <button
                            onClick={() => handleSpeak(m.text, i)}
                            title={speakingIndex === i ? "Stop Audio" : "Listen to Briefing"}
                            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${
                              speakingIndex === i ? "text-[#0066FF] animate-pulse" : "text-slate-400"
                            }`}
                          >
                            {speakingIndex === i ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          </button>
                          {/* Copy Briefing Button */}
                          <button
                            onClick={() => handleCopy(m.text, i)}
                            title="Copy briefing"
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            {copiedIndex === i ? <Check size={13} className="text-[#00E599]" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Attached TV News Channel Broadcasts */}
                    {m.videos?.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/10">
                        <p className="text-[10px] font-black tracking-wider uppercase text-[#FF1053] dark:text-[#FF1053] mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF1053] animate-pulse"></span>
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
                              <div className="w-36 h-20 rounded-xl overflow-hidden bg-slate-900 relative border border-slate-200/80 dark:border-white/10 shadow-sm group-hover:border-[#0066FF]/60 transition-all">
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
                                  <span className="w-6 h-6 rounded-full bg-[#FF1053] text-white flex items-center justify-center text-[10px] shadow-md group-hover:scale-110 transition-transform">
                                    ▶
                                  </span>
                                </span>
                                {v.channel && (
                                  <span className="absolute bottom-1 left-1 bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold truncate max-w-[90%]">
                                    {v.channel}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-800 dark:text-slate-200 leading-tight mt-1.5 line-clamp-2 font-semibold group-hover:text-[#0066FF] dark:group-hover:text-[#00E5FF] transition-colors">
                                {v.title}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attached News Wire Articles */}
                    {m.articles?.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Sources & Wires
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.articles.slice(0, 3).map((art, aIdx) => (
                            <a
                              key={aIdx}
                              href={art.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-[#0066FF] dark:hover:text-[#00E5FF] transition-colors"
                            >
                              <span className="truncate max-w-[120px]">{art.source}</span>
                              <ExternalLink size={9} />
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
                  <div className="bg-slate-100 dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.1] rounded-2xl rounded-bl-xs px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                    <Loader2 size={15} className="animate-spin text-[#FF1053]" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Synthesizing live TV feeds & global news wires...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar with Voice Mic and Send */}
            <div className="p-3 border-t border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#060913] flex items-center gap-2 shrink-0">
              <button
                onClick={toggleSpeechRecognition}
                title={isListening ? "Listening... Click to stop" : "Speak to AI News"}
                aria-label="Voice input"
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? "bg-[#FF1053] text-white border-[#FF1053] animate-pulse shadow-glow-crimson"
                    : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/15"
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isListening ? "Listening to your voice..." : "Ask breaking events, TV bulletins, topics..."}
                className="flex-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none border border-slate-200 dark:border-white/10 focus:border-[#0066FF] dark:focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
              />

              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="bg-gradient-to-r from-[#FF1053] to-[#0066FF] hover:from-[#E11D48] hover:to-[#0052CC] text-white rounded-xl p-2.5 disabled:opacity-40 shadow-sm transition-all active:scale-95"
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