import { useState } from "react";
import {
  ArrowLeft,
  Tag as TagIcon,
  Plus,
  ImagePlus,
  Eye,
  Edit3,
  BookmarkPlus,
  AlertCircle,
} from "lucide-react";
import type { Post, ViewState } from "../types";
import { estimateReadingMinutes, wordCount, parseBody } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import Cover from "./Cover";

const coverOptions = [
  { from: "#55643E", to: "#3E4A2C" },
  { from: "#7A3B2E", to: "#4E241C" },
  { from: "#B4832A", to: "#8A611E" },
  { from: "#524A3D", to: "#211D18" },
  { from: "#3C4A52", to: "#232C31" },
];

function closestCoverIdx(cover?: { from: string; to: string }) {
  if (!cover) return 0;
  const idx = coverOptions.findIndex((c) => c.from === cover.from && c.to === cover.to);
  return idx === -1 ? 0 : idx;
}

export default function Editor({
  setView,
  existingPost,
}: {
  setView: (v: ViewState) => void;
  existingPost: Post | null;
}) {
  const { currentUser } = useAuth();
  const { categories, addPost, updatePost } = usePosts();
  const isEditing = Boolean(existingPost);

  // Guard against non-author editing
  const forbidden = isEditing && existingPost && currentUser?.id !== existingPost.authorId;

  // Resolve initial category
  const initialCategorySlug =
    existingPost?.category?.slug ||
    (existingPost && existingPost.tags[0]) ||
    categories[0]?.slug ||
    "essays";

  const initialExtraTags = existingPost
    ? existingPost.tags
        .filter((t) => t.toLowerCase() !== initialCategorySlug.toLowerCase())
        .join(", ")
    : "";

  const [title, setTitle] = useState(existingPost?.title || "");
  const [body, setBody] = useState(existingPost?.body || existingPost?.content || "");
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug);
  const [tagsInput, setTagsInput] = useState(initialExtraTags);
  const [coverIdx, setCoverIdx] = useState(closestCoverIdx(existingPost?.cover));
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-[22px] text-ink mb-2">You need to log in to write.</p>
        <p className="font-body text-inkSoft mb-6">
          Creating and editing entries is only available to signed-in authors.
        </p>
        <button
          onClick={() => setView({ name: "feed" })}
          className="font-mono text-[13px] text-inkSoft underline hover:opacity-70 transition"
        >
          Back to entries
        </button>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-[22px] text-ink mb-2">This entry isn't yours to edit.</p>
        <p className="font-body text-inkSoft mb-6">
          You can only edit entries you've written yourself.
        </p>
        <button
          onClick={() => setView({ name: "feed" })}
          className="font-mono text-[13px] text-inkSoft underline hover:opacity-70 transition"
        >
          Back to entries
        </button>
      </div>
    );
  }

  const wc = wordCount(body);
  const readingMinutes = estimateReadingMinutes(body);
  const previewParagraphs = parseBody(body);

  function insertMarginNoteSnippet() {
    const snippet = "\n\n@@MARGIN:Add your marginal commentary here@@\n\n";
    setBody((prev) => prev + snippet);
  }

  async function handleSave() {
    if (!title.trim() || !body.trim() || !currentUser) return;

    try {
      setSaving(true);
      setSaveError(null);

      const extraTags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .filter((t) => t !== categorySlug.toLowerCase());

      const tags = [categorySlug.toLowerCase(), ...extraTags];
      const selectedCover = coverOptions[coverIdx];

      if (isEditing && existingPost) {
        const updated = await updatePost(existingPost.id, {
          title: title.trim(),
          body: body.trim(),
          categorySlug,
          tags,
          cover: selectedCover,
        });
        setView({ name: "post", id: updated.id });
      } else {
        const created = await addPost({
          title: title.trim(),
          body: body.trim(),
          categorySlug,
          tags,
          cover: selectedCover,
        });
        setView({ name: "post", id: created.id });
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to save entry. Please try again.");
      setSaving(false);
    }
  }

  // Available categories (dynamic with defaults)
  const availableCategories =
    categories.length > 0
      ? categories
      : [
          { id: "1", name: "Essays", slug: "essays" },
          { id: "2", name: "Craft", slug: "craft" },
          { id: "3", name: "Cities", slug: "cities" },
          { id: "4", name: "Tech", slug: "tech" },
        ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Back and Tab Buttons */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() =>
            setView(isEditing && existingPost ? { name: "post", id: existingPost.id } : { name: "feed" })
          }
          className="flex items-center gap-1.5 text-[13px] hover:text-ink transition text-inkSoft font-mono"
        >
          <ArrowLeft size={14} />
          Discard and go back
        </button>

        <div className="flex items-center border rounded-sm p-0.5" style={{ borderColor: "#CBBFA0" }}>
          <button
            onClick={() => setMode("write")}
            className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-mono transition ${
              mode === "write" ? "bg-ink text-paper" : "text-inkSoft hover:text-ink"
            }`}
          >
            <Edit3 size={12} />
            Write
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-mono transition ${
              mode === "preview" ? "bg-ink text-paper" : "text-inkSoft hover:text-ink"
            }`}
          >
            <Eye size={12} />
            Preview
          </button>
        </div>
      </div>

      <div className="text-[11px] tracking-[0.15em] uppercase mb-3 text-moss font-mono">
        {isEditing ? "Editing entry" : "New entry"} · signed in as {currentUser.displayName}
      </div>

      {saveError && (
        <div className="mb-6 p-4 border flex items-center gap-2 bg-red-50 text-brick text-[13px] font-mono" style={{ borderColor: "#7A3B2E" }}>
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {mode === "write" ? (
        <>
          {/* Title Input */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title"
            className="w-full bg-transparent outline-none mb-6 pb-2 border-b font-display text-ink"
            style={{ fontSize: 38, fontWeight: 600, borderColor: "#CBBFA0" }}
          />

          {/* Category Selector */}
          <div className="mb-5">
            <div className="text-[11px] tracking-[0.15em] uppercase mb-2 flex items-center gap-1.5 text-inkSoft font-mono">
              <TagIcon size={12} />
              Section
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {availableCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategorySlug(cat.slug)}
                  className="text-[12px] px-2.5 py-1 border transition font-mono"
                  style={{
                    borderColor: categorySlug.toLowerCase() === cat.slug.toLowerCase() ? "#211D18" : "#CBBFA0",
                    background: categorySlug.toLowerCase() === cat.slug.toLowerCase() ? "#211D18" : "transparent",
                    color: categorySlug.toLowerCase() === cat.slug.toLowerCase() ? "#EDE6D6" : "#524A3D",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags and Cover Palette */}
          <div className="flex items-center justify-between gap-6 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <TagIcon size={14} className="text-inkSoft" />
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="additional tags, comma separated"
                className="bg-transparent outline-none text-[13px] w-60 font-mono text-ink border-b pb-0.5"
                style={{ borderColor: "#CBBFA0" }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[12px] font-mono text-inkSoft">
                <ImagePlus size={14} />
                Cover style
              </div>
              <div className="flex gap-1.5">
                {coverOptions.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCoverIdx(i)}
                    aria-label={`Cover option ${i + 1}`}
                    className="w-6 h-6 transition rounded-xs cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                      outline: coverIdx === i ? "2px solid #211D18" : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Helper Toolbar */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b" style={{ borderColor: "#E5DEC9" }}>
            <span className="text-[11px] font-mono text-inkSoft">
              Separate paragraphs with a blank line. Use marginal notes for side comments.
            </span>
            <button
              onClick={insertMarginNoteSnippet}
              className="flex items-center gap-1 text-[11px] font-mono text-moss hover:underline"
            >
              <BookmarkPlus size={12} />
              + Insert Margin Note
            </button>
          </div>

          {/* Body Textarea */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              "Write your entry here. Separate paragraphs with a blank line.\n\nTo add a margin note pinned beside the previous paragraph, insert:\n@@MARGIN:Your note text here@@"
            }
            rows={16}
            className="w-full bg-transparent outline-none resize-none mb-3 font-body text-ink"
            style={{ fontSize: 17, lineHeight: 1.7 }}
          />
        </>
      ) : (
        /* Preview Mode */
        <div className="mb-10">
          <Cover cover={coverOptions[coverIdx]} className="h-56 w-full mb-8 rounded-sm shadow-sm" />
          <h1 className="text-[38px] font-display font-semibold text-ink mb-6">
            {title || "Untitled Entry"}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
            <div>
              {previewParagraphs.map((p, idx) => (
                <div key={idx} className="mb-6">
                  <p className="text-[17px] leading-[1.75] font-body text-ink">{p.text}</p>
                  {p.note && (
                    <div
                      className="md:hidden mt-2 pl-3 border-l-2 text-[13px] italic font-display text-inkSoft"
                      style={{ borderColor: "#B4832A" }}
                    >
                      {p.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              <div className="sticky top-20 space-y-8">
                {previewParagraphs.map((p, idx) =>
                  p.note ? (
                    <div
                      key={idx}
                      className="text-[13px] italic leading-relaxed pl-3 font-display text-inkSoft"
                      style={{ borderLeft: "1px dotted #B4832A" }}
                    >
                      {p.note}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Publishing Bar */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#CBBFA0" }}>
        <div className="text-[12px] text-inkSoft font-mono">
          {wc} words · ~{readingMinutes} min read
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !body.trim()}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] tracking-wide transition hover:opacity-85 disabled:opacity-40 bg-ink text-paper font-mono"
        >
          <Plus size={14} />
          {saving ? "Saving..." : isEditing ? "Save changes" : "Publish entry"}
        </button>
      </div>
    </div>
  );
}
