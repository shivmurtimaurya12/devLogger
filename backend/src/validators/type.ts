import { z } from "zod";

// ==========================================
// Authentication Schemas
// ==========================================

export const registerSchema = z
  .object({
    username: z.string().min(2).optional(),
    name: z.string().optional(),
    displayName: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  })


  // .refine((data) => data.email || data.username, {
  //   message: "Either username or email is required for registration",
  //   path: ["username"],
  // });

export const loginSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(),
    username: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })


// ==========================================
// Category Schemas
// ==========================================

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

// ==========================================
// Post Schemas
// ==========================================

export const createPostSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().optional(),
    content: z.string().optional(),
    body: z.string().optional(),
    excerpt: z.string().optional(),
    categoryId: z.string().optional(),
    categorySlug: z.string().optional(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    cover: z
      .object({
        from: z.string(),
        to: z.string(),
      })
      .optional(),
    coverFrom: z.string().optional(),
    coverTo: z.string().optional(),
    readingMinutes: z.number().optional(),
  })
  
  // .refine((data) => Boolean(data.content || data.body), {
  //   message: "Post content or body is required",
  //   path: ["content"],
  // });

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
  body: z.string().optional(),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  cover: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .optional(),
  coverFrom: z.string().optional(),
  coverTo: z.string().optional(),
  readingMinutes: z.number().optional(),
});

// ==========================================
// Comment Schemas
// ==========================================

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
  postId: z.string().optional(),
});
