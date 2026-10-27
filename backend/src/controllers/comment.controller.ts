import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Format comment for consistent client representation.
 */
const formatComment = (c: any) => ({
  id: c.id,
  content: c.content,
  postId: c.postId,
  authorId: c.authorId,
  authorName: c.author?.name || c.author?.username || "Anonymous",
  author: c.author
    ? {
        id: c.author.id,
        name: c.author.name,
        username: c.author.username,
        displayName: c.author.name || c.author.username || "Anonymous",
      }
    : undefined,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

/**
 * Get all comments for a specific post.
 */
export const getCommentsForPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { postId } = req.params;

    // Find post by id or slug
    const post = await prisma.post.findFirst({
      where: { OR: [{ id: postId }, { slug: postId }] },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      include: {
        author: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(comments.map(formatComment));
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Internal server error fetching comments" });
  }
};

/**
 * Add a new comment to a post.
 */
export const createComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Comment text cannot be empty" });
      return;
    }

    const post = await prisma.post.findFirst({
      where: { OR: [{ id: postId }, { slug: postId }] },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: post.id,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, name: true, username: true } },
      },
    });

    res.status(201).json(formatComment(comment));
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Internal server error creating comment" });
  }
};

/**
 * Delete a comment. Ensures that the deleter is the comment author.
 */
export const deleteComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (comment.authorId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden: You are not the author of this comment" });
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully", id: commentId });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error deleting comment" });
  }
};
