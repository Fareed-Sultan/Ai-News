export const CATEGORIES = [
  { id: "general", label: "Top Stories", shortLabel: "Top", color: "rose", bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/30" },
  { id: "technology", label: "Technology & AI", shortLabel: "Tech", color: "blue", bg: "bg-blue-600", text: "text-blue-500", border: "border-blue-500/30" },
  { id: "business", label: "Global Markets", shortLabel: "Business", color: "amber", bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30" },
  { id: "sports", label: "Sports Arena", shortLabel: "Sports", color: "emerald", bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/30" },
  { id: "entertainment", label: "Culture & Cinema", shortLabel: "Culture", color: "purple", bg: "bg-purple-600", text: "text-purple-500", border: "border-purple-500/30" },
  { id: "health", label: "Health & Life", shortLabel: "Health", color: "teal", bg: "bg-teal-500", text: "text-teal-500", border: "border-teal-500/30" },
  { id: "science", label: "Science & Space", shortLabel: "Science", color: "cyan", bg: "bg-cyan-500", text: "text-cyan-500", border: "border-cyan-500/30" },
];

export function getCategoryMeta(categoryId) {
  return (
    CATEGORIES.find((c) => c.id === categoryId) || {
      id: "general",
      label: "News",
      shortLabel: "News",
      color: "rose",
      bg: "bg-rose-500",
      text: "text-rose-500",
      border: "border-rose-500/30",
    }
  );
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const units = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.secs);
    if (value >= 1) return `${value}${unit.label} ago`;
  }
  return "just now";
}
