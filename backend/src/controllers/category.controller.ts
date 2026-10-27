import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * Get all categories with post counts.
 */
export const getCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      postCount: c._count.posts,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error fetching categories" });
  }
};

/**
 * Create a new category.
 */
export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, slug } = req.body;
    const cleanSlug = (slug || name.toLowerCase().replace(/\s+/g, "-")).trim();

    const existing = await prisma.category.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      res.status(400).json({ error: "Category slug already exists" });
      return;
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug: cleanSlug },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Internal server error creating category" });
  }
};
