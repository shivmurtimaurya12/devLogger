import { useState } from "react";
import { Search, PenLine, X, LogOut, UserCircle2 } from "lucide-react";
import type { ViewState, Section } from "../types";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { sections as defaultSections } from "../data/sections";

export default function Masthead({
  setView,
  query,
  setQuery,
  showSearch,
  setShowSearch,
  activeTag,
  setActiveTag,
  onRequireAuth,
}: {
  setView: (v: ViewState) => void;
  query: string;
  setQuery: (q: string) => void;
  showSearch: boolean;
  setShowSearch: (b: boolean) => void;
  activeTag: string | null;
  setActiveTag: (t: string | null) => void;
  onRequireAuth: (target: ViewState, message: string) => void;
}) {
  const { currentUser, logout } = useAuth();
  const { categories } = usePosts();
  const [menuOpen, setMenuOpen] = useState(false);

  // Derive nav sections from backend categories if loaded, otherwise fallback to defaults
  const navSections = [
    { id: "all", label: "All entries", tag: null },
    ...(categories.length > 0
      ? categories.map((c) => ({
          id: c.slug,
          label: c.name,
          tag: c.slug,
        }))
      : defaultSections.filter((s: Section) => s.tag !== null)),
  ];

  function handleWriteClick() {
    if (!currentUser) {
      onRequireAuth({ name: "editor" }, "Log in to write a new entry.");
      return;
    }
    setView({ name: "editor" });
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-paper" style={{ borderColor: "#CBBFA0" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between pt-5 pb-4">
          <button
            onClick={() => {
              setView({ name: "feed" });
              setActiveTag(null);
            }}
            className="text-left font-display group"
          >
            <div className="text-[28px] leading-none tracking-tight text-ink font-semibold group-hover:opacity-80 transition">
              <span style={{color:"#5fade8"}}>Dev</span><span style={{color:"#133f61"}}>Logger</span>
            </div>
            <div className="text-[11px] tracking-[0.18em] uppercase mt-3 text-inkSoft font-mono">
              Notes in the margin of ordinary things
            </div>
          </button>

          <div className="flex items-center gap-4">
            {showSearch ? (
              <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: "#211D18" }}>
                <Search size={15} className="text-inkSoft" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search entries…"
                  className="bg-transparent outline-none text-[14px] w-44 font-body text-ink"
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setQuery("");
                  }}
                  aria-label="Close search"
                  className="hover:opacity-70 transition p-0.5"
                >
                  <X size={14} className="text-inkSoft" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                aria-label="Search"
                className="p-1.5 hover:opacity-70 transition rounded"
              >
                <Search size={17} className="text-ink" />
              </button>
            )}

            <button
              onClick={handleWriteClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] tracking-wide transition hover:opacity-85 bg-ink text-paper font-mono shadow-sm"
            >
              <PenLine size={13} />
              Write
            </button>

            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-[13px] font-mono text-inkSoft hover:text-ink transition border px-2 py-1 rounded-sm"
                  style={{ borderColor: "#CBBFA0" }}
                >
                  <UserCircle2 size={16} />
                  <span>{currentUser.displayName || currentUser.username}</span>
                </button>
              ) : (
                <button
                  onClick={() => onRequireAuth({ name: "feed" }, "Log in to your account.")}
                  className="text-[13px] font-mono text-inkSoft hover:text-ink transition underline"
                >
                  Log in
                </button>
              )}

              {menuOpen && currentUser && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-paper border py-1 shadow-md z-50 rounded-sm"
                  style={{ borderColor: "#CBBFA0" }}
                >
                  <div className="px-3.5 py-2.5 border-b text-[12px] font-mono text-inkSoft" style={{ borderColor: "#CBBFA0" }}>
                    Signed in as
                    <div className="text-ink font-semibold text-[13px] mt-0.5 truncate">
                      {currentUser.displayName}
                    </div>
                    {/* {currentUser.email && (
                      <div className="text-[11px] text-inkSoft/80 truncate">{currentUser.email}</div>
                    )} */}
                  </div>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      setView({ name: "feed" });
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-mono text-brick hover:bg-stone-100/50 transition"
                  >
                    <LogOut size={13} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section nav */}
        <nav className="flex items-center gap-6 pb-3 overflow-x-auto no-scrollbar">
          {navSections.map((s) => {
            const isActive = (s.tag === null && activeTag === null) || s.tag === activeTag;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setView({ name: "feed" });
                  setActiveTag(s.tag);
                }}
                className="relative pb-2 text-[13px] whitespace-nowrap transition hover:opacity-75 font-mono"
                style={{
                  color: isActive ? "#211D18" : "#524A3D",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {s.label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 -bottom-[13px] h-[2px]"
                    style={{ background: s.id === "tech" ? "#3C4A52" : "#B4832A" }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
