"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import LiveStatusBar from "@/components/LiveStatusBar";
import ArticleGrid from "@/components/ArticleGrid";
import ArticleModal from "@/components/ArticleModal";
import BookmarksDrawer from "@/components/BookmarksDrawer";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import AIResultsPanel from "@/components/AIResultsPanel";
import { useNews } from "@/lib/useNews";
import { useBookmarks } from "@/lib/useBookmarks";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("pk");
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [openArticle, setOpenArticle] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const { articles, status, error, lastUpdated, hasMore, loadMore, refresh } = useNews({
    category,
    query: activeQuery,
    country,
  });
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();

  const title = useMemo(() => {
    if (activeQuery) return `Live Results: "${activeQuery}"`;
    return CATEGORIES.find((c) => c.id === category)?.label || "Top Stories";
  }, [activeQuery, category]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070A12] text-slate-900 dark:text-slate-100">
      <Ticker articles={articles} />
      <Header
        activeCategory={category}
        onCategoryChange={setCategory}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={setActiveQuery}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setDrawerOpen(true)}
        country={country}
        onCountryChange={setCountry}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIResultsPanel result={aiResult} onClose={() => setAiResult(null)} />
        <LiveStatusBar
          title={title}
          lastUpdated={lastUpdated}
          status={status}
          onRefresh={refresh}
          articleCount={articles?.length || 0}
        />
        <ArticleGrid
          articles={articles}
          status={status}
          error={error}
          onOpen={setOpenArticle}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          onRetry={refresh}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </main>

      <Footer />

      <ArticleModal
        article={openArticle}
        onClose={() => setOpenArticle(null)}
        isBookmarked={openArticle ? isBookmarked(openArticle.id) : false}
        onToggleBookmark={toggleBookmark}
      />

      <BookmarksDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bookmarks={bookmarks}
        onToggleBookmark={toggleBookmark}
        onOpenArticle={(article) => {
          setDrawerOpen(false);
          setOpenArticle(article);
        }}
      />

      <ChatWidget country={country} onResult={setAiResult} />
    </div>
  );
}