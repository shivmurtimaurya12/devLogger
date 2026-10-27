import { Router } from "express";
import {
  getPosts,
  getPostByIdOrSlug,
  createPost,
  updatePost,
  deletePost,
  recordView,
} from "../controllers/post.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createPostSchema, updatePostSchema } from "../validators/type";

const router = Router();

router.get("/", getPosts);
router.get("/:identifier", getPostByIdOrSlug);
router.post("/:id/view", recordView);
router.post("/", authenticate, validate(createPostSchema), createPost);
router.put("/:id", authenticate, validate(updatePostSchema), updatePost);
router.delete("/:id", authenticate, deletePost);

export default router;
