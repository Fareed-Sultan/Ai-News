"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, BookmarkX, Bookmark, ArrowRight, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import { proxiedImage } from "@/lib/imageProxy";
import { getEditorialFallback } from "@/lib/newsImages";

export default function BookmarksDrawer({
  isOpen,
  onClose,
  bookmarks,
  onToggleBookmark,
  onOpenArticle,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white dark:bg-[#060913] shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white/95 dark:bg-[#060913]/95 backdrop-blur-md z-10 shrink-0">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-[#FF1053] fill-[#FF1053]" />
                <h2 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                  Saved Reading List
                </h2>
                {bookmarks.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF1053] text-white">
                    {bookmarks.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close reading list"
                className="bg-slate-100 dark:bg-white/10 rounded-full p-2 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-700 dark:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {bookmarks.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mb-4">
                    <Bookmark size={24} />
                  </div>
                  <p className="font-display font-black text-lg text-slate-900 dark:text-white mb-1">
                    Your reading list is empty
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
                    Bookmark interesting stories from the feed by clicking the bookmark icon on any card to read them anytime.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-white/[0.08]">
                  {bookmarks.map((article, idx) => {
                    const fallback = getEditorialFallback(article.title, article.category, idx);
                    const displayImg = article.image ? proxiedImage(article.image) : fallback;

                    return (
                      <li
                        key={article.id || article.url || idx}
                        className="p-4 sm:p-5 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                        onClick={() => onOpenArticle(article)}
                      >
                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displayImg}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              if (e.currentTarget.src !== fallback) {
                                e.currentTarget.src = fallback;
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#FF1053] dark:text-[#FF1053] mb-1">
                              {article.source} · {timeAgo(article.publishedAt)}
                            </p>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#0066FF] dark:group-hover:text-[#00E5FF] transition-colors">
                              {article.title}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] font-black text-slate-400 group-hover:text-[#0066FF] dark:group-hover:text-[#00E5FF] flex items-center gap-1 uppercase tracking-wider">
                              Read <ArrowRight size={11} />
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(article);
                              }}
                              aria-label="Remove from reading list"
                              className="text-slate-400 hover:text-[#FF1053] transition-colors p-1"
                              title="Remove"
                            >
                              <BookmarkX size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}