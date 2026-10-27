import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock,
  PenLine,
  Eye,
  Trash2,
  MessageSquare,
  Send,
  Share2,
  Check,
  User as UserIcon,
} from "lucide-react";
import type { Post, ViewState } from "../types";
import { formatDate, parseBody } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import Cover from "./Cover";

export default function PostView({
  post,
  setView,
  onRequireAuth,
}: {
  post: Post;
  setView: (v: ViewState) => void;
  onRequireAuth: (target: ViewState, message: string) => void;
}) {
  const bodyText = post.body || post.content || "";
  const paragraphs = useMemo(() => parseBody(bodyText), [bodyText]);
  const { currentUser } = useAuth();
  const { recordRead, deletePost, addComment, deleteComment } = usePosts();

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    recordRead(post.id);
  }, [post.id, recordRead]);

  const isOwner = currentUser?.id === post.authorId;

  function handleEditClick() {
    if (!currentUser) {
      onRequireAuth({ name: "editor", id: post.id }, "Log in to edit this entry.");
      return;
    }
    setView({ name: "editor", id: post.id });
  }

  async function handleDeletePost() {
    try {
      setDeletingPost(true);
      await deletePost(post.id);
      setView({ name: "feed" });
    } catch (err: any) {
      alert("Failed to delete post: " + (err.message || "Unknown error"));
      setDeletingPost(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser) {
      onRequireAuth({ name: "post", id: post.id }, "Sign in to leave a comment.");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError(null);
      await addComment(post.id, commentText.trim());
      setCommentText("");
    } catch (err: any) {
      setCommentError(err.message || "Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!window.confirm("Delete your comment?")) return;
    try {
      await deleteComment(commentId, post.id);
    } catch (err: any) {
      alert("Failed to delete comment: " + (err.message || "Unknown error"));
    }
  }

  function handleCopyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const comments = post.comments || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-10 border-b pb-4" style={{ borderColor: "#CBBFA0" }}>
        <button
          onClick={() => setView({ name: "feed" })}
          className="flex items-center gap-1.5 text-[13px] hover:text-ink transition text-inkSoft font-mono"
        >
          <ArrowLeft size={14} />
          Back to entries
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 border transition hover:bg-stone-50 text-inkSoft font-mono"
            style={{ borderColor: "#CBBFA0" }}
            title="Copy link to clipboard"
          >
            {copiedLink ? <Check size={13} className="text-moss" /> : <Share2 size={13} />}
            {copiedLink ? "Link copied" : "Share"}
          </button>

          {isOwner && (
            <>
              <button
                onClick={handleEditClick}
                className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 border transition hover:bg-stone-50 text-ink font-mono"
                style={{ borderColor: "#CBBFA0" }}
              >
                <PenLine size={13} />
                Edit entry
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 border transition hover:bg-red-50 text-brick font-mono"
                style={{ borderColor: "#CBBFA0" }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-ink/60"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-paper border p-6 max-w-md w-full shadow-lg"
            style={{ borderColor: "#CBBFA0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-[20px] font-semibold text-ink mb-2">Delete this entry?</h3>
            <p className="font-body text-[14px] text-inkSoft mb-6">
              Are you sure you want to delete <span className="font-medium text-ink">"{post.title}"</span>?
              This action cannot be undone and will permanently remove this piece and its comments.
            </p>
            <div className="flex items-center justify-end gap-3 font-mono text-[13px]">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border hover:bg-stone-50 transition"
                style={{ borderColor: "#CBBFA0" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="px-4 py-2 bg-brick text-paper hover:opacity-90 transition disabled:opacity-50"
              >
                {deletingPost ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Cover */}
      <Cover cover={post.cover} className="h-64 md:h-80 w-full mb-10 rounded-sm shadow-sm" />

      {/* Article Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 text-[12px] mb-4 text-moss font-mono flex-wrap">
          <span>{formatDate(post.date)}</span>
          <span style={{ color: "#CBBFA0" }}>·</span>
          <span>by {post.authorName}</span>
          <span style={{ color: "#CBBFA0" }}>·</span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {post.readingMinutes} min read
          </span>
          <span style={{ color: "#CBBFA0" }}>·</span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {post.readCount} reads
          </span>
        </div>
        <h1 className="text-[40px] md:text-[48px] leading-[1.08] mb-6 font-display font-semibold text-ink">
          {post.title}
        </h1>
        <div className="flex items-center gap-2 mb-12 flex-wrap">
          {post.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 font-mono text-moss bg-paper"
              style={{ border: "1px solid #CBBFA0" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content with Marginalia Rail */}
      <div className="max-w-2xl mx-auto md:max-w-none md:grid md:grid-cols-[1fr_220px] md:gap-10 pb-16 border-b" style={{ borderColor: "#CBBFA0" }}>
        <div className="max-w-2xl">
          {paragraphs.map((p, idx) => (
            <div key={idx} className="relative mb-6 md:mb-8">
              <p className="text-[19px] leading-[1.75] font-body text-ink">{p.text}</p>
              {p.note && (
                <div
                  className="md:hidden mt-3 pl-4 border-l-2 text-[14px] italic leading-relaxed font-display text-inkSoft"
                  style={{ borderColor: "#B4832A" }}
                >
                  {p.note}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden md:block relative">
          <div className="sticky top-24 space-y-0">
            {paragraphs.map((p, idx) =>
              p.note ? (
                <div
                  key={idx}
                  className="text-[13.5px] italic leading-relaxed pl-4 relative mb-10 font-display text-inkSoft"
                  style={{ borderLeft: "1px dotted #B4832A" }}
                >
                  <span
                    className="absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full"
                    style={{ background: "#B4832A" }}
                  />
                  {p.note}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Reflections & Comments Section */}
      <div className="max-w-2xl mx-auto mt-14">
        <div className="flex items-center gap-2 mb-8 pb-3 border-b" style={{ borderColor: "#CBBFA0" }}>
          <MessageSquare size={17} className="text-moss" />
          <h2 className="font-display text-[22px] font-semibold text-ink">
            Reflections ({comments.length})
          </h2>
        </div>

        {/* Comment Input Box */}
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="mb-10">
            <div className="border p-3.5 bg-paper rounded-sm" style={{ borderColor: "#CBBFA0" }}>
              <div className="text-[11px] font-mono text-inkSoft mb-2 flex items-center gap-1.5">
                <UserIcon size={12} />
                <span>Leaving a note as <strong>{currentUser.displayName}</strong></span>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share a reflection, response, or margin note on this entry…"
                rows={3}
                className="w-full bg-transparent outline-none text-[15px] font-body text-ink resize-none placeholder:text-inkSoft/60"
              />
              {commentError && (
                <p className="text-[12px] text-brick font-mono mb-2">{commentError}</p>
              )}
              <div className="flex items-center justify-between pt-2 border-t mt-2" style={{ borderColor: "#E5DEC9" }}>
                <span className="text-[11px] text-inkSoft font-mono">
                  {commentText.length} characters
                </span>
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-mono bg-ink text-paper hover:opacity-85 transition disabled:opacity-40"
                >
                  <Send size={12} />
                  {submittingComment ? "Posting..." : "Post Reflection"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-5 mb-10 border text-center rounded-sm bg-stone-50/50" style={{ borderColor: "#CBBFA0" }}>
            <p className="font-body text-[15px] text-inkSoft mb-3">
              Join the conversation and add your reflections to this piece.
            </p>
            <button
              onClick={() => onRequireAuth({ name: "post", id: post.id }, "Log in to post a reflection.")}
              className="px-4 py-1.5 text-[12px] font-mono bg-ink text-paper hover:opacity-85 transition"
            >
              Sign in to reflect
            </button>
          </div>
        )}

        {/* List of Comments */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-inkSoft font-mono text-[13px]">
            No reflections yet. Be the first to leave a thought.
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => {
              const isCommentAuthor = currentUser?.id === comment.authorId;
              return (
                <div
                  key={comment.id}
                  className="border-b pb-5 relative group"
                  style={{ borderColor: "#E5DEC9" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-moss/20 text-moss font-mono text-[11px] flex items-center justify-center font-bold">
                        {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : "A"}
                      </div>
                      <span className="font-mono text-[13px] font-medium text-ink">
                        {comment.authorName}
                      </span>
                      <span style={{ color: "#CBBFA0" }}>·</span>
                      <span className="font-mono text-[11px] text-inkSoft">
                        {formatDate(comment.createdAt ? comment.createdAt.slice(0, 10) : "")}
                      </span>
                    </div>

                    {isCommentAuthor && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-inkSoft hover:text-brick transition text-[11px] font-mono flex items-center gap-1 opacity-70 hover:opacity-100"
                        title="Delete reflection"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="font-body text-[15px] leading-relaxed text-ink pl-8">
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
