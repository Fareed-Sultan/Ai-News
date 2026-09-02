"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Clock,
  Radio,
  FileText,
} from "lucide-react";
import { timeAgo, getCategoryMeta } from "@/lib/categories";
import { proxiedImage } from "@/lib/imageProxy";
import { getEditorialFallback } from "@/lib/newsImages";

export default function ArticleModal({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) {
  const [copied, setCopied] = useState(false);
  const fallbackPhoto = article ? getEditorialFallback(article.title, article.category) : null;
  const displayImage = article?.image ? proxiedImage(article.image) : fallbackPhoto;

  const handleShare = (e) => {
    e.stopPropagation();
    if (!article) return;
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

  const categoryMeta = article ? getCategoryMeta(article.category) : null;

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 w-full sm:max-w-2xl lg:max-w-3xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            {/* Modal Hero Image */}
            <div className="h-60 sm:h-80 bg-slate-950 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt={article.title || ""}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.currentTarget.src !== fallbackPhoto) {
                    e.currentTarget.src = fallbackPhoto;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 pointer-events-none" />

              {/* Source & Close Bar */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {article.source}
                </span>

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 rounded-full p-2 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Bottom Meta Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-3 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {timeAgo(article.publishedAt)}
                </span>
                {article.author && <span>· By {article.author}</span>}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight">
                {article.title}
              </h2>

              {/* Takeaway Brief Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  <FileText size={14} />
                  <span>Story Overview</span>
                </div>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {article.description || "No full summary preview is available for this wire release."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-white/[0.08]">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-glow-red transition-all"
                >
                  Read Full Original Story
                  <ExternalLink size={15} />
                </a>

                <button
                  onClick={() => onToggleBookmark(article)}
                  className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.05] text-slate-800 dark:text-slate-200 px-5 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck size={16} className="text-emerald-500 fill-emerald-500" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} /> Save for later
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/[0.05] text-slate-800 dark:text-slate-200 px-5 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={15} className="text-emerald-500" /> Link Copied
                    </>
                  ) : (
                    <>
                      <Share2 size={15} /> Share
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}