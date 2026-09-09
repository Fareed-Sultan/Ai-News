"use client";

import { CATEGORIES } from "@/lib/categories";
import { Mail, Sparkles, ShieldCheck, Radio, Zap } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-white/10 mt-20 bg-white dark:bg-[#060913] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF1053] via-[#0066FF] to-[#00E5FF] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
                  <span className="font-display font-black text-xl text-white">P</span>
                </div>
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white uppercase">
                PULSE <span className="text-[#FF1053]">24/7</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md font-medium">
              Real-time journalism, breaking global headlines, multi-channel TV news broadcast verification, and AI-powered intelligence delivering accurate facts 24/7.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} className="text-[#00E599]" />
              <span>Verified Multi-Channel News Intelligence</span>
            </div>
          </div>

          {/* Quick Category Hub */}
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              News Desks
            </h4>
            <ul className="space-y-2.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-[#FF1053] dark:hover:text-[#FF1053] transition-colors uppercase tracking-wider"
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Alert Signup */}
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Daily Intelligence Brief
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed font-medium">
              Get the top verified headlines, morning bulletins, and AI news briefings directly.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-xs font-black">
                ✓ Subscribed to Pulse 24/7 Alerts!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 rounded-xl p-1 focus-within:border-[#0066FF] transition-all">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-transparent outline-none text-xs px-2.5 py-1 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF1053] to-[#E11D48] hover:from-[#E11D48] hover:to-[#BE123C] text-white text-xs font-black transition-all shadow-sm shrink-0 active:scale-95"
                  >
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PULSE Global News & AI Network. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Powered by live multi-source wire syndication &</span>
            <a
              href="https://newsapi.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066FF] dark:text-[#00E5FF] font-bold hover:underline"
            >
              NewsAPI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
