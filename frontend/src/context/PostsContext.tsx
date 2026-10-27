import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { Post, Category, Comment } from "../types";
import { postsApi, categoriesApi, commentsApi } from "../api/client";

interface PostsContextValue {
  posts: Post[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshPosts: () => Promise<void>;
  addPost: (postData: {
    title: string;
    body: string;
    categorySlug?: string;
    categoryId?: string;
    tags?: string[];
    cover?: { from: string; to: string };
  }) => Promise<Post>;
  updatePost: (
    id: string,
    postData: Partial<{
      title: string;
      body: string;
      categorySlug?: string;
      categoryId?: string;
      tags?: string[];
      cover?: { from: string; to: string };
    }>
  ) => Promise<Post>;
  deletePost: (id: string) => Promise<boolean>;
  recordRead: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<Comment>;
  deleteComment: (commentId: string, postId: string) => Promise<boolean>;
}

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // In-memory set to deduplicate view count increments in this tab session
  const readInSession = useRef<Set<string>>(new Set());

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedPosts, fetchedCategories] = await Promise.all([
        postsApi.getAll(),
        categoriesApi.getAll().catch(() => []),
      ]);
      setPosts(fetchedPosts);
      setCategories(fetchedCategories);
    } catch (err: any) {
      console.error("Error loading posts from API:", err);
      setError(err.message || "Failed to load posts from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const addPost = useCallback(
    async (postData: {
      title: string;
      body: string;
      categorySlug?: string;
      categoryId?: string;
      tags?: string[];
      cover?: { from: string; to: string };
    }) => {
      const created = await postsApi.create(postData);
      setPosts((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updatePost = useCallback(
    async (
      id: string,
      postData: Partial<{
        title: string;
        body: string;
        categorySlug?: string;
        categoryId?: string;
        tags?: string[];
        cover?: { from: string; to: string };
      }>
    ) => {
      const updated = await postsApi.update(id, postData);
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    []
  );

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      await postsApi.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error("Failed to delete post:", err);
      throw err;
    }
  }, []);

  const recordRead = useCallback(async (postId: string) => {
    if (readInSession.current.has(postId)) return;
    readInSession.current.add(postId);

    try {
      const result = await postsApi.recordView(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, readCount: result.readCount, views: result.readCount } : p
        )
      );
    } catch (err) {
      // Non-critical, ignore silent view failure
      console.warn("View record skipped:", err);
    }
  }, []);

  const addComment = useCallback(
    async (postId: string, content: string): Promise<Comment> => {
      const newComment = await commentsApi.create(postId, content);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const existingComments = p.comments || [];
            return {
              ...p,
              comments: [newComment, ...existingComments],
            };
          }
          return p;
        })
      );
      return newComment;
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: string, postId: string): Promise<boolean> => {
      await commentsApi.delete(commentId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: (p.comments || []).filter((c) => c.id !== commentId),
            };
          }
          return p;
        })
      );
      return true;
    },
    []
  );

  return (
    <PostsContext.Provider
      value={{
        posts,
        categories,
        loading,
        error,
        refreshPosts: fetchAllData,
        addPost,
        updatePost,
        deletePost,
        recordRead,
        addComment,
        deleteComment,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts(): PostsContextValue {
  const ctx = useContext(PostsContext);
  if (!ctx) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return ctx;
}
