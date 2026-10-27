import { useMemo } from "react";
import { Clock, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import type { Post, ViewState } from "../types";
import { formatDate } from "../utils/format";
import { usePosts } from "../context/PostsContext";
import Cover from "./Cover";

export default function Feed({
  posts,
  setView,
  query,
  activeTag,
  setActiveTag,
}: {
  posts: Post[];
  setView: (v: ViewState) => void;
  query: string;
  activeTag: string | null;
  setActiveTag: (t: string | null) => void;
}) {
  const { categories, loading, error, refreshPosts } = usePosts();

  const sectionTags = useMemo(() => {
    return new Set(categories.map((c) => c.slug.toLowerCase()));
  }, [categories]);

  // Aggregate all extra tags (excluding top-level section categories)
  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        if (!sectionTags.has(t.toLowerCase())) {
          s.add(t.toLowerCase());
        }
      });
    });
    return Array.from(s).sort();
  }, [posts, sectionTags]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = query.toLowerCase().trim();
      const bodyText = p.body || p.content || "";
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        bodyText.toLowerCase().includes(q);

      const matchesTag =
        !activeTag ||
        (p.tags || []).some((t) => t.toLowerCase() === activeTag.toLowerCase()) ||
        p.category?.slug.toLowerCase() === activeTag.toLowerCase();

      return matchesQuery && matchesTag;
    });
  }, [posts, query, activeTag]);

  const activeCategory = categories.find(
    (c) => c.slug.toLowerCase() === (activeTag || "").toLowerCase()
  );
  const featured = !query && !activeTag ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-stone-200/60 rounded"></div>
          <div className="space-y-4">
            <div className="h-8 bg-stone-200/60 w-3/4 rounded"></div>
            <div className="h-4 bg-stone-200/60 w-full rounded"></div>
            <div className="h-4 bg-stone-200/60 w-1/2 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex p-3 rounded-full bg-brick/10 text-brick mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="font-display text-[22px] text-ink mb-2">Could not reach the archive</h2>
        <p className="font-body text-[15px] text-inkSoft mb-6">{error}</p>
        <button
          onClick={() => refreshPosts()}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-mono bg-ink text-paper hover:opacity-85 transition"
        >
          <RefreshCw size={13} />
          Try reconnecting
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Category header when filtering by section */}
      {activeCategory && (
        <div className="mb-8 border-b pb-4" style={{ borderColor: "#CBBFA0" }}>
          <div className="flex items-center justify-between">
            <h1 className="text-[15px] tracking-[0.15em] uppercase font-mono text-moss">
              Section — {activeCategory.name}
            </h1>
            <span className="text-[12px] font-mono text-inkSoft">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </div>
      )}

      {/* Query filter indicator */}
      {query && (
        <div className="mb-6 flex items-center justify-between border-b pb-3" style={{ borderColor: "#CBBFA0" }}>
          <div className="font-mono text-[13px] text-inkSoft">
            Search results for <span className="text-ink font-semibold">"{query}"</span>
          </div>
          <span className="text-[12px] font-mono text-inkSoft">
            {filtered.length} matching {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>
      )}

      {/* Secondary Tags Rail */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-10">
          <span className="text-[11px] tracking-[0.15em] uppercase mr-1 text-inkSoft font-mono">
            Tags
          </span>
          <button
            onClick={() => setActiveTag(null)}
            className="text-[12px] px-2.5 py-1 border transition font-mono"
            style={{
              borderColor: !activeTag ? "#211D18" : "#CBBFA0",
              background: !activeTag ? "#211D18" : "transparent",
              color: !activeTag ? "#EDE6D6" : "#524A3D",
            }}
          >
            all
          </button>
          {allTags.map((t) => {
            const isSelected = activeTag?.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                onClick={() => setActiveTag(isSelected ? null : t)}
                className="text-[12px] px-2.5 py-1 border transition font-mono"
                style={{
                  borderColor: isSelected ? "#211D18" : "#CBBFA0",
                  background: isSelected ? "#211D18" : "transparent",
                  color: isSelected ? "#EDE6D6" : "#524A3D",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-24 text-center text-inkSoft">
          <p className="font-display text-[22px] text-ink">No entries match your search.</p>
          <p className="text-sm mt-2 text-inkSoft font-body">Try clearing your filters or search terms.</p>
          <button
            onClick={() => {
              setActiveTag(null);
            }}
            className="mt-4 text-[13px] font-mono underline hover:opacity-75 transition"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Featured Lead Post */}
      {featured && (
        <button
          onClick={() => setView({ name: "post", id: featured.id })}
          className="w-full text-left grid grid-cols-1 md:grid-cols-5 gap-8 mb-14 pb-14 border-b group cursor-pointer"
          style={{ borderColor: "#CBBFA0" }}
        >
          <Cover cover={featured.cover} className="md:col-span-2 h-56 md:h-full min-h-[220px] rounded-sm shadow-sm" />
          <div className="md:col-span-3 flex flex-col justify-center">
            <div className="text-[11px] tracking-[0.15em] uppercase mb-3 flex items-center gap-3 text-moss font-mono flex-wrap">
              <span>Latest publication</span>
              <span style={{ color: "#CBBFA0" }}>·</span>
              <span>{formatDate(featured.date)}</span>
              <span style={{ color: "#CBBFA0" }}>·</span>
              <span>{featured.authorName}</span>
            </div>
            <h2 className="text-[34px] leading-[1.12] mb-4 group-hover:opacity-75 transition font-display font-medium text-ink">
              {featured.title}
            </h2>
            <p className="text-[16px] leading-[1.65] mb-4 font-body text-inkSoft line-clamp-3">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-4 text-[12px] text-inkSoft font-mono flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {featured.readingMinutes} min read
              </span>
              <span>{featured.readCount} reads</span>
              {featured.comments && featured.comments.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  {featured.comments.length}
                </span>
              )}
            </div>
          </div>
        </button>
      )}

      {/* List of Entries */}
      <div className="divide-y" style={{ borderColor: "#CBBFA0" }}>
        {rest.map((post) => (
          <button
            key={post.id}
            onClick={() => setView({ name: "post", id: post.id })}
            className="w-full text-left grid grid-cols-[90px_1fr] md:grid-cols-[110px_1fr_auto] gap-4 md:gap-8 py-7 group items-start hover:bg-stone-50/50 transition px-2 rounded-sm"
          >
            <div className="text-[12px] pt-1 text-inkSoft font-mono">{formatDate(post.date)}</div>
            <div>
              <h3 className="text-[22px] leading-[1.3] mb-2 group-hover:opacity-75 transition font-display font-medium text-ink">
                {post.title}
              </h3>
              <p className="text-[15px] leading-[1.6] font-body text-inkSoft line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 font-mono text-moss bg-paper"
                    style={{ border: "1px solid #CBBFA0" }}
                  >
                    {t}
                  </span>
                ))}
                <span className="text-[11px] text-inkSoft font-mono ml-1">by {post.authorName}</span>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1.5 text-[12px] pt-1 whitespace-nowrap text-inkSoft font-mono">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {post.readingMinutes} min
              </span>
              <span>{post.readCount} reads</span>
              {post.comments && post.comments.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-inkSoft/80">
                  <MessageSquare size={11} />
                  {post.comments.length}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
