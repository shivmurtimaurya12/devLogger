import type { Post, User, Category, Comment } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";


/**
 * In-memory storage for JWT token.
 * Note: Authentication is also supported via secure HTTP-only cookies.
 */
let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  inMemoryToken = token;
};

export const getAuthToken = (): string | null => {
  return inMemoryToken;
};

/**
 * Base fetch wrapper with error parsing and credentials support.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (inMemoryToken) {
    headers["Authorization"] = `Bearer ${inMemoryToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Ensure session cookies are sent cross-origin
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (isJson && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

// ==========================================
// Auth API
// ==========================================

export const authApi = {
  login: async (
    identifier: string,
    password: string,
  ): Promise<{ user: User; token: string }> => {
    const data = await request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  register: async (params: {
    username: string;
    password: string;
    displayName: string;
    email?: string;
  }): Promise<{ user: User; token: string }> => {
    const data = await request<{ user: User; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
    setAuthToken(data.token);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setAuthToken(null);
    }
  },

  getMe: async (): Promise<{ user: User }> => {
    return request<{ user: User }>("/auth/me");
  },
};

// ==========================================
// Posts API
// ==========================================

export const postsApi = {
  getAll: async (params?: {
    category?: string | null;
    tag?: string | null;
    search?: string;
  }): Promise<Post[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.tag) query.append("tag", params.tag);
    if (params?.search) query.append("search", params.search);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<Post[]>(`/posts${qs}`);
  },

  getByIdOrSlug: async (identifier: string): Promise<Post> => {
    return request<Post>(`/posts/${encodeURIComponent(identifier)}`);
  },

  create: async (postData: {
    title: string;
    body: string;
    categorySlug?: string;
    categoryId?: string;
    tags?: string[];
    cover?: { from: string; to: string };
  }): Promise<Post> => {
    return request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  update: async (
    id: string,
    postData: Partial<{
      title: string;
      body: string;
      categorySlug?: string;
      categoryId?: string;
      tags?: string[];
      cover?: { from: string; to: string };
    }>,
  ): Promise<Post> => {
    return request<Post>(`/posts/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  },

  delete: async (id: string): Promise<{ message: string; id: string }> => {
    return request<{ message: string; id: string }>(
      `/posts/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  },

  recordView: async (
    id: string,
  ): Promise<{ id: string; readCount: number }> => {
    return request<{ id: string; readCount: number }>(
      `/posts/${encodeURIComponent(id)}/view`,
      {
        method: "POST",
      },
    );
  },
};

// ==========================================
// Categories API
// ==========================================

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return request<Category[]>("/categories");
  },

  create: async (data: { name: string; slug: string }): Promise<Category> => {
    return request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ==========================================
// Comments API
// ==========================================

export const commentsApi = {
  getForPost: async (postId: string): Promise<Comment[]> => {
    return request<Comment[]>(`/posts/${encodeURIComponent(postId)}/comments`);
  },

  create: async (postId: string, content: string): Promise<Comment> => {
    return request<Comment>(`/posts/${encodeURIComponent(postId)}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  delete: async (
    commentId: string,
  ): Promise<{ message: string; id: string }> => {
    return request<{ message: string; id: string }>(
      `/comments/${encodeURIComponent(commentId)}`,
      {
        method: "DELETE",
      },
    );
  },
};
