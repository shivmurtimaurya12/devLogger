import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Standardizes post object format for frontend compatibility.
 * Provides both legacy frontend fields (body, cover, readCount, date)
 * and modern backend fields (content, views, category, author).
 */
export const formatPost = (post: any) => {
  const content = post.content || post.body || "";
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const calculatedMinutes = Math.max(1, Math.round(words / 200));

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || content.replace(/@@MARGIN:.*?@@/g, "").slice(0, 160).trim(),
    body: content,
    content: content,
    date: post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    readingMinutes: post.readingMinutes || calculatedMinutes,
    tags: Array.isArray(post.tags)
      ? post.tags.map((t: any) => (typeof t === "string" ? t : t.name))
      : [],
    cover: {
      from: post.coverFrom || "#55643E",
      to: post.coverTo || "#3E4A2C",
    },
    coverFrom: post.coverFrom || "#55643E",
    coverTo: post.coverTo || "#3E4A2C",
    authorId: post.authorId,
    authorName: post.author?.name || post.author?.username || "Anonymous",
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.name,
          username: post.author.username,
          email: post.author.email,
          displayName: post.author.name || post.author.username || "Anonymous",
        }
      : undefined,
    readCount: post.views,
    views: post.views,
    published: post.published ?? true,
    categoryId: post.categoryId,
    category: post.category,
    comments: Array.isArray(post.comments)
      ? post.comments.map((c: any) => ({
          id: c.id,
          content: c.content,
          postId: c.postId,
          authorId: c.authorId,
          authorName: c.author?.name || c.author?.username || "Anonymous",
          createdAt: c.createdAt,
        }))
      : [],
  };
};

/**
 * Generate a URL-friendly slug from title.
 */
function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "entry"}-${Date.now().toString(36)}`;
}

/**
 * List posts with optional search, category, and tag filtering.
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, tag, authorId } = req.query;

    const where: any = {};

    if (search && typeof search === "string") {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && typeof category === "string") {
      where.category = {
        OR: [{ slug: category }, { id: category }, { name: category }],
      };
    }

    if (tag && typeof tag === "string") {
      where.tags = {
        some: {
          OR: [{ slug: tag.toLowerCase() }, { name: tag.toLowerCase() }],
        },
      };
    }

    if (authorId && typeof authorId === "string") {
      where.authorId = authorId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, username: true, email: true } },
        category: true,
        tags: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(posts.map(formatPost));
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ error: "Internal server error fetching posts" });
  }
};

/**
 * Retrieve a post by ID or slug. Automatically increments view count unless disabled.
 */
export const getPostByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        author: { select: { id: true, name: true, username: true, email: true } },
        category: true,
        tags: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Increment view count if requested or by default
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: { views: post.views + 1 },
      include: {
        author: { select: { id: true, name: true, username: true, email: true } },
        category: true,
        tags: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.status(200).json(formatPost(updatedPost));
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Internal server error fetching post" });
  }
};

/**
 * Increment view count for a specific post.
 */
export const recordView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { views: post.views + 1 },
      select: { id: true, views: true },
    });

    res.status(200).json({ id: updated.id, readCount: updated.views, views: updated.views });
  } catch (error) {
    console.error("Record view error:", error);
    res.status(500).json({ error: "Internal server error updating views" });
  }
};

/**
 * Create a new post.
 */
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      content,
      body,
      excerpt,
      categoryId,
      categorySlug,
      tags,
      published,
      cover,
      coverFrom,
      coverTo,
      readingMinutes,
    } = req.body;

    const effectiveContent = (content || body || "").trim();
    if (!effectiveContent) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    // Determine category
    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      const slugToFind = categorySlug || "essays";
      const foundCategory = await prisma.category.findFirst({
        where: {
          OR: [{ slug: slugToFind }, { name: { equals: slugToFind, mode: "insensitive" } }],
        },
      });

      if (foundCategory) {
        targetCategoryId = foundCategory.id;
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: slugToFind.charAt(0).toUpperCase() + slugToFind.slice(1),
            slug: slugToFind.toLowerCase(),
          },
        });
        targetCategoryId = newCat.id;
      }
    }

    // Auto-generate slug if not provided
    const effectiveSlug = slug?.trim() || slugify(title);

    // Prepare tags
    const tagList: string[] = Array.isArray(tags) ? tags : [];
    const tagConnectOrCreate = tagList
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .map((t) => ({
        where: { slug: t.replace(/\s+/g, "-") },
        create: { name: t, slug: t.replace(/\s+/g, "-") },
      }));

    const wordCount = effectiveContent.split(/\s+/).length;
    const estMinutes = readingMinutes || Math.max(1, Math.round(wordCount / 200));

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug: effectiveSlug,
        content: effectiveContent,
        excerpt: excerpt?.trim() || effectiveContent.replace(/@@MARGIN:.*?@@/g, "").slice(0, 160).trim(),
        coverFrom: cover?.from || coverFrom || "#55643E",
        coverTo: cover?.to || coverTo || "#3E4A2C",
        readingMinutes: estMinutes,
        published: published ?? true,
        authorId: req.user!.id,
        categoryId: targetCategoryId,
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        author: { select: { id: true, name: true, username: true, email: true } },
        category: true,
        tags: true,
        comments: true,
      },
    });

    res.status(201).json(formatPost(post));
  } catch (error: any) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Internal server error creating post", details: error.message });
  }
};

/**
 * Update an existing post. Ensures author ownership.
 */
export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (post.authorId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden: You are not authorized to edit this post" });
      return;
    }

    const {
      title,
      content,
      body,
      excerpt,
      categoryId,
      categorySlug,
      tags,
      published,
      cover,
      coverFrom,
      coverTo,
      readingMinutes,
    } = req.body;

    const data: any = {};
    if (title) data.title = title.trim();
    if (content || body) {
      data.content = (content || body).trim();
      const words = data.content.split(/\s+/).length;
      data.readingMinutes = readingMinutes || Math.max(1, Math.round(words / 200));
    }
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (published !== undefined) data.published = published;
    if (cover?.from || coverFrom) data.coverFrom = cover?.from || coverFrom;
    if (cover?.to || coverTo) data.coverTo = cover?.to || coverTo;

    if (categoryId) {
      data.categoryId = categoryId;
    } else if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) data.categoryId = cat.id;
    }

    if (Array.isArray(tags)) {
      const tagConnectOrCreate = tags
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .map((t) => ({
          where: { slug: t.replace(/\s+/g, "-") },
          create: { name: t, slug: t.replace(/\s+/g, "-") },
        }));

      data.tags = {
        set: [], // reset existing relations
        connectOrCreate: tagConnectOrCreate,
      };
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data,
      include: {
        author: { select: { id: true, name: true, username: true, email: true } },
        category: true,
        tags: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.status(200).json(formatPost(updated));
  } catch (error: any) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Internal server error updating post" });
  }
};

/**
 * Delete a post. Ensures author ownership and cascades comments.
 */
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (post.authorId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden: You are not authorized to delete this post" });
      return;
    }

    await prisma.comment.deleteMany({ where: { postId: post.id } });
    await prisma.post.delete({ where: { id: post.id } });

    res.status(200).json({ message: "Post deleted successfully", id: post.id });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Internal server error deleting post" });
  }
};
