export const CATEGORIES = [
  { id: "general", label: "Top Stories", shortLabel: "Top", color: "crimson", bg: "bg-[#FF1053]", text: "text-[#FF1053]", border: "border-[#FF1053]/40" },
  { id: "technology", label: "Technology & AI", shortLabel: "Tech", color: "blue", bg: "bg-[#0066FF]", text: "text-[#0066FF]", border: "border-[#0066FF]/40" },
  { id: "business", label: "Global Markets", shortLabel: "Business", color: "amber", bg: "bg-[#FFB703]", text: "text-[#FFB703]", border: "border-[#FFB703]/40" },
  { id: "sports", label: "Sports Arena", shortLabel: "Sports", color: "emerald", bg: "bg-[#00E599]", text: "text-[#00E599]", border: "border-[#00E599]/40" },
  { id: "entertainment", label: "Culture & Cinema", shortLabel: "Culture", color: "purple", bg: "bg-[#9333EA]", text: "text-[#9333EA]", border: "border-[#9333EA]/40" },
  { id: "health", label: "Health & Life", shortLabel: "Health", color: "teal", bg: "bg-[#0D9488]", text: "text-[#0D9488]", border: "border-[#0D9488]/40" },
  { id: "science", label: "Science & Space", shortLabel: "Science", color: "cyan", bg: "bg-[#00E5FF]", text: "text-[#00E5FF]", border: "border-[#00E5FF]/40" },
];

export function getCategoryMeta(categoryId) {
  return (
    CATEGORIES.find((c) => c.id === categoryId) || {
      id: "general",
      label: "Top Stories",
      shortLabel: "Top",
      color: "crimson",
      bg: "bg-[#FF1053]",
      text: "text-[#FF1053]",
      border: "border-[#FF1053]/40",
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
