"use client";

import { useEffect, useRef } from "react";
import ArticleCard from "./ArticleCard";
import SkeletonCard from "./SkeletonCard";
import { Flame, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { timeAgo } from "@/lib/categories";

export default function ArticleGrid({
  articles,
  status,
  error,
  onOpen,
  isBookmarked,
  onToggleBookmark,
  onRetry,
  hasMore,
  onLoadMore,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore || status === "loading" || status === "loadingMore" || status === "error") {
      return;
    }
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && status !== "loadingMore") {
          onLoadMore();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, status, hasMore, articles?.length]);

  if (status === "loading") {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard featured />
          </div>
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-20 px-4 border border-dashed border-[#FF1053]/40 rounded-2xl bg-[#FF1053]/[0.03]">
        <div className="w-12 h-12 rounded-full bg-[#FF1053]/10 text-[#FF1053] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertCircle size={24} />
        </div>
        <p className="font-display font-black text-2xl text-slate-900 dark:text-white mb-2">
          Unable to Connect to Live News Wire
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto font-medium">{error}</p>
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-[#FF1053] to-[#E11D48] hover:from-[#E11D48] hover:to-[#BE123C] text-white px-6 py-2.5 rounded-full text-sm font-black shadow-md hover:shadow-glow-crimson transition-all active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-white/15 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02]">
        <p className="font-display font-black text-2xl text-slate-900 dark:text-white mb-2">
          No live headlines matched your search.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
          Try searching with broad keywords (e.g., <span className="font-bold text-slate-800 dark:text-slate-200">"Pakistan"</span>, <span className="font-bold text-slate-800 dark:text-slate-200">"AI"</span>, or <span className="font-bold text-slate-800 dark:text-slate-200">"Cricket"</span>) or select another category from the masthead.
        </p>
      </div>
    );
  }

  // Segment articles: First is Hero Story, next 3 are Trending Wire, rest are in the main grid
  const [heroArticle, ...remaining] = articles;
  const trendingStories = remaining.slice(0, 3);
  const gridStories = remaining.slice(3);

  return (
    <div className="space-y-10">
      {/* Featured Magazine Top Tier */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Hero Article */}
        <div className="lg:col-span-2">
          <ArticleCard
            key={heroArticle.url || heroArticle.id}
            article={heroArticle}
            index={0}
            featured
            onOpen={onOpen}
            isBookmarked={isBookmarked(heroArticle.id)}
            onToggleBookmark={onToggleBookmark}
          />
        </div>

        {/* Trending Wire Column */}
        {trendingStories.length > 0 && (
          <aside className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#0B1120] p-5 shadow-news-card dark:shadow-news-card-dark flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-white/[0.08]">
                <Flame size={16} className="text-[#FFB703] fill-[#FFB703]" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  Trending Wire
                </h3>
              </div>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-white/[0.06]">
                {trendingStories.map((item, idx) => (
                  <div
                    key={item.url || item.id || idx}
                    onClick={() => onOpen(item)}
                    className="pt-4 first:pt-0 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-display font-black text-2xl text-slate-300 dark:text-slate-600 group-hover:text-[#FF1053] transition-colors leading-none shrink-0 w-6">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                          <span className="truncate text-slate-600 dark:text-slate-300 font-bold">{item.source}</span>
                          <span>•</span>
                          <span>{timeAgo(item.publishedAt)}</span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#0066FF] dark:group-hover:text-[#00E5FF] transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Updated Live</span>
              <span className="flex items-center gap-1 text-[#FF1053] dark:text-[#FF1053] font-black uppercase tracking-wider">
                Top Picks <ArrowRight size={13} />
              </span>
            </div>
          </aside>
        )}
      </section>

      {/* Main Multi-Column Story Grid */}
      {gridStories.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase tracking-wide">
              More Top Reporting
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridStories.map((article, i) => (
              <ArticleCard
                key={article.url || article.id || i}
                article={article}
                index={i + 4}
                onOpen={onOpen}
                isBookmarked={isBookmarked(article.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        </section>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && <div ref={sentinelRef} className="h-6 w-full my-4" aria-hidden />}

      {status === "loadingMore" && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="w-3.5 h-3.5 border-2 border-[#FF1053] border-t-transparent rounded-full animate-spin" />
            Loading more verified stories…
          </div>
        </div>
      )}

      {!hasMore && status !== "loadingMore" && articles.length > 0 && (
        <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-8 uppercase tracking-wider">
          ✦ You're fully caught up with the latest live reports. ✦
        </p>
      )}
    </div>
  );
}
