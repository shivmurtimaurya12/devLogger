export interface Cover {
  from: string;
  to: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface Post {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  body: string;
  content?: string;
  date: string; // ISO date, e.g. 2026-07-02
  createdAt?: string;
  updatedAt?: string;
  readingMinutes: number;
  tags: string[]; // first tag is generally the section category
  cover: Cover;
  coverFrom?: string;
  coverTo?: string;
  authorId: string;
  authorName: string;
  readCount: number;
  views?: number;
  published?: boolean;
  categoryId?: string;
  category?: Category;
  comments?: Comment[];
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  name?: string;
}

export interface Section {
  id: string;
  label: string;
  tag: string | null; // null = "All"
}

export type ViewState =
  | { name: "feed" }
  | { name: "post"; id: string }
  | { name: "editor"; id?: string }; // id present = editing an existing post
