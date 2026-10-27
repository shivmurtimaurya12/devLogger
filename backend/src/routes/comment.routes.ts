import { Router } from "express";
import {
  getCommentsForPost,
  createComment,
  deleteComment,
} from "../controllers/comment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createCommentSchema } from "../validators/type";

const router = Router({ mergeParams: true }); // Access :postId from parent router

router.get("/", getCommentsForPost);
router.post("/", authenticate, validate(createCommentSchema), createComment);
router.delete("/:commentId", authenticate, deleteComment);

export default router;
