"use client";

import { CATEGORIES } from "@/lib/categories";
import { Mail, Sparkles, ShieldCheck, Radio } from "lucide-react";
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
    <footer className="border-t border-slate-200 dark:border-white/10 mt-20 bg-white dark:bg-[#080C14] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 via-rose-500 to-blue-600 p-0.5 shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-display font-black text-lg text-white">P</span>
                </div>
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white uppercase">
                PULSE <span className="text-rose-600">24/7</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
              Real-time journalism, breaking global headlines, TV news broadcast verification, and AI-powered news intelligence delivering facts as they happen.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Verified Global Wire Sources</span>
            </div>
          </div>

          {/* Quick Category Hub */}
          <div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              News Desks
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Alert Signup */}
          <div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Daily Intelligence Brief
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Get the top morning headlines and verified broadcast reports delivered directly.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                ✓ You're subscribed to breaking alerts!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 rounded-xl p-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-transparent outline-none text-xs px-2.5 py-1 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shrink-0"
                  >
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PULSE Global News Network. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Powered by live multi-source wire syndication &</span>
            <a
              href="https://newsapi.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-800 dark:text-slate-200 font-bold hover:underline"
            >
              NewsAPI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

