import "./globals.css";

export const metadata = {
  title: "PULSE 24/7 — Live World News, Breaking Headlines & TV Intelligence",
  description:
    "PULSE is a premier live news network offering real-time global reporting, breaking news broadcasts, deep-dive journalism, and instant AI news intelligence.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Runs before React hydrates so the page never flashes the wrong
            theme on load. Reads the saved preference, falling back to the
            OS-level color-scheme setting if the user hasn't chosen yet. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pulse-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-body antialiased bg-[#F8FAFC] dark:bg-[#070A12] text-slate-900 dark:text-slate-100 min-h-screen selection:bg-brand-crimson selection:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

