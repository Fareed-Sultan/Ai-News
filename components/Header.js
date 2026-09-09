"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  Globe2,
  Bookmark,
  Sun,
  Moon,
  TrendingUp,
  Radio,
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/categories";
import { COUNTRIES } from "@/lib/countries";
import { useTheme } from "@/lib/useTheme";
import Dropdown from "@/components/Dropdown";

export default function Header({
  activeCategory,
  onCategoryChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  bookmarkCount,
  onOpenBookmarks,
  country,
  onCountryChange,
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  const [currentDate, setCurrentDate] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setMobileSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentCountryObj = COUNTRIES.find((c) => c.code === country);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#060913]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.1] shadow-sm transition-colors duration-300">
      {/* Top Utility Broadcast Bar */}
      <div className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-black/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3">
          {/* Left: Date & Live Beacon */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[#FF1053]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1053] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1053]"></span>
              </span>
              LIVE FEED
            </span>
            <span className="hidden sm:inline-block text-slate-300 dark:text-white/20">|</span>
            <span className="hidden sm:inline font-semibold tracking-wide text-slate-700 dark:text-slate-300">
              {currentDate}
            </span>
          </div>

          {/* Center / Right: Reading List, Country Selector & Dark Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <button
              onClick={onOpenBookmarks}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 dark:bg-white/[0.08] hover:bg-slate-300/80 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 transition-all text-[11px] font-bold"
              title="View Bookmarked Articles"
            >
              <Bookmark size={12} className="text-[#FF1053] fill-[#FF1053]/20" />
              <span>Saved</span>
              {bookmarkCount > 0 && (
                <span className="ml-0.5 bg-[#FF1053] text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {bookmarkCount}
                </span>
              )}
            </button>

            <Dropdown
              value={country}
              icon={Globe2}
              label="Country"
              onSelect={onCountryChange}
              items={COUNTRIES.map((c) => ({ value: c.code, label: `${c.name}` }))}
            />

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200/60 dark:bg-white/[0.08] hover:bg-slate-300/70 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {!mounted ? (
                  <span className="w-3.5 h-3.5" />
                ) : theme === "dark" ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Sun size={14} className="text-[#FFB703]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Moon size={14} className="text-slate-800" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead Tier */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 md:py-4 gap-4">
          {/* Logo Brand */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSearchChange("");
              onSearchSubmit("");
              onCategoryChange("general");
            }}
            className="group flex items-center gap-3 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF1053] via-[#0066FF] to-[#00E5FF] p-0.5 shadow-md group-hover:shadow-glow-crimson transition-all">
              <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
                <span className="font-display font-black text-2xl text-white tracking-tighter">P</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white uppercase">
                  PULSE
                </span>
                <span className="text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded bg-[#FF1053] text-white uppercase shadow-xs">
                  24/7
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase -mt-0.5">
                Global News & AI Network
              </span>
            </div>
          </a>

          {/* Desktop Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit(searchValue);
              }}
              className="w-full flex items-center gap-2 bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/10 rounded-xl px-3.5 py-2 shadow-inner focus-within:border-[#0066FF] dark:focus-within:border-[#0066FF] focus-within:ring-2 focus-within:ring-[#0066FF]/20 transition-all"
            >
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search breaking stories, topics, keywords..."
                className="bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full font-medium"
              />
              {searchValue ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    onSearchChange("");
                    onSearchSubmit("");
                  }}
                  className="hover:opacity-75 transition-opacity"
                >
                  <X size={14} className="text-slate-400" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 shadow-xs">
                  Ctrl K
                </kbd>
              )}
            </form>
          </div>

          {/* Mobile Search Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200"
              aria-label="Search"
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>
        </div>

        {/* Category Navigation Pills with Sharp Neon Highlights */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-100 dark:border-white/[0.06]">
          {CATEGORIES.map((cat) => {
            const isActive = !searchValue && activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSearchChange("");
                  onSearchSubmit("");
                  onCategoryChange(cat.id);
                }}
                className={`relative px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#060913] text-white dark:bg-white dark:text-[#060913] shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                }`}
              >
                {cat.label}
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryIndicator"
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#FF1053] rounded-full shadow-glow-crimson"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Search Row Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit(searchValue);
                setMobileSearchOpen(false);
              }}
              className="sm:hidden pb-3 pt-1"
            >
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search live stories & topics..."
                  className="bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 w-full"
                />
                {searchValue && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      onSearchChange("");
                      onSearchSubmit("");
                    }}
                  >
                    <X size={15} className="text-slate-400" />
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Sharp Border Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#FF1053] via-[#0066FF] to-[#00E5FF] opacity-95 shadow-sm" />
    </header>
  );
}
