"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Share2, Clock, Check, Sparkles } from "lucide-react";
import { timeAgo, getCategoryMeta } from "@/lib/categories";
import { proxiedImage } from "@/lib/imageProxy";
import { getEditorialFallback } from "@/lib/newsImages";

export default function ArticleCard({
  article,
  index = 0,
  featured = false,
  onOpen,
  isBookmarked,
  onToggleBookmark,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const categoryMeta = getCategoryMeta(article.category);
  const fallbackPhoto = getEditorialFallback(article.title, article.category, index);
  const displayImage = !imgFailed && article.image ? proxiedImage(article.image) : fallbackPhoto;

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share && article.url) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      }).catch(() => {});
    } else if (article.url) {
      navigator.clipboard?.writeText(article.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Rough reading time calculation
  const words = (article.title + " " + (article.description || "")).split(" ").length;
  const readMins = Math.max(1, Math.ceil(words / 40));

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25) }}
      whileHover={{ y: -6 }}
      onClick={() => onOpen(article)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#0B1120] cursor-pointer shadow-news-card dark:shadow-news-card-dark hover:border-[#0066FF]/50 dark:hover:border-[#0066FF]/60 transition-all duration-300 ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* Image Container with Gradient Overlays */}
      <div
        className={`relative overflow-hidden bg-slate-950 ${
          featured ? "h-64 sm:h-80 md:h-96" : "h-48"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={article.title || "News story image"}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Dynamic Dual Gradient for high text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

        {/* Source Badge with Sharp Glowing Accent */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF1053] animate-pulse" />
          <span className="truncate max-w-[130px]">{article.source}</span>
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {/* Share Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleShare}
            aria-label="Share article"
            className="bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 rounded-full p-2 text-white transition-colors shadow-xs"
          >
            {copied ? <Check size={14} className="text-[#00E599]" /> : <Share2 size={14} />}
          </motion.button>

          {/* Bookmark Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            aria-label={isBookmarked ? "Remove bookmark" : "Save article"}
            className="bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/20 rounded-full p-2 text-white transition-colors shadow-xs"
          >
            <motion.span
              key={isBookmarked ? "saved" : "unsaved"}
              initial={{ scale: 0.6, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {isBookmarked ? (
                <BookmarkCheck size={14} className="text-[#00E599] fill-[#00E599]" />
              ) : (
                <Bookmark size={14} className="text-white" />
              )}
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2.5">
        {/* Meta Bar */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <Clock size={11} className="text-[#0066FF]" />
            {timeAgo(article.publishedAt)}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {readMins} MIN READ
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-display font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#0066FF] dark:group-hover:text-[#00E5FF] transition-colors ${
            featured ? "text-xl sm:text-2xl md:text-3xl" : "text-base sm:text-lg"
          }`}
        >
          {article.title}
        </h3>

        {/* Excerpt for Featured / Regular */}
        {article.description && (
          <p
            className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal ${
              featured ? "line-clamp-3 mt-1" : "line-clamp-2"
            }`}
          >
            {article.description}
          </p>
        )}

        {/* Bottom Anchor / Read prompt */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.06] text-xs font-black text-[#FF1053] uppercase tracking-wider">
          <span>Read Full Story →</span>
        </div>
      </div>
    </motion.article>
  );
}