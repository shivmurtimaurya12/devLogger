import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import categoryRoutes from "./routes/category.routes";
import commentRoutes from "./routes/comment.routes";
import { deleteComment } from "./controllers/comment.controller";
import { authenticate } from "./middlewares/auth.middleware";

// dotenv.config();


const app = express();

// Configure CORS to allow frontend requests with credentials
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET || "supersecretjwtkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Primary API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:postId/comments", commentRoutes);

// Direct comment management (e.g. DELETE /api/comments/:commentId)
app.delete("/api/comments/:commentId", authenticate, deleteComment);

// 404 handler for unmatched routes
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: `API endpoint '${req.path}' not found` });
    return;
  }
  res.status(404).send("Not Found");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
