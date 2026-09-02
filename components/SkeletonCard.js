export default function SkeletonCard({ featured = false }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0D1527] shadow-news-card dark:shadow-news-card-dark ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div className={`shimmer animate-shimmer ${featured ? "h-64 sm:h-80 md:h-96" : "h-48"}`} />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex justify-between">
          <div className="shimmer animate-shimmer h-3 w-20 rounded-full" />
          <div className="shimmer animate-shimmer h-3 w-14 rounded-full" />
        </div>
        <div className="shimmer animate-shimmer h-5 w-full rounded-lg" />
        <div className="shimmer animate-shimmer h-4 w-4/5 rounded-lg" />
        <div className="pt-2">
          <div className="shimmer animate-shimmer h-3 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

