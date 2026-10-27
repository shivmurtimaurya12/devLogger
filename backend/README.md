# DevLogger Backend

Robust RESTful API service for The Sidenote publication platform.

## Tech Stack
- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM & pg adapter)
- **Validation**: Zod
- **Authentication**: JWT & secure HTTP-only cookies

---

## Getting Started

### 1. Install Dependencies
```bash
bun install
```

### 2. Environment Variables
Configure `.env` in the `backend` directory:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/blogDB"
JWT_SECRET="mysecretekey"
PORT=8080
NODE_ENV=development
```

### 3. Database Migration & Seed
Run the migration script to apply database schema updates:
```bash
bun run migrate
```

To seed the initial sample authors (Maya Ortiz, Theo Banks), categories, and rich articles:
```bash
bun run seed
```

### 4. Start the Server
```bash
# Development (with file watch)
bun run dev

# Production
bun run start
```

The server will start at `http://localhost:8080`.

---

## API Endpoints

### Health Check
- `GET /api/health` — Service status check.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new author account.
  - Body: `{ username?, name?, displayName?, email?, password }` (requires at least 6 characters for password).
- `POST /api/auth/login` — Sign in with email or username and password.
  - Body: `{ identifier, password }` or `{ username, password }` or `{ email, password }`.
- `POST /api/auth/logout` — Clear session cookies.
- `GET /api/auth/me` — Retrieve currently authenticated user profile.

### Categories (`/api/categories`)
- `GET /api/categories` — List all categories with associated post counts.
- `POST /api/categories` — Create a new category *(Requires authentication)*.
  - Body: `{ name, slug }`.

### Posts (`/api/posts`)
- `GET /api/posts` — List posts with support for query filters:
  - `?category=<slug>`: Filter by category.
  - `?tag=<name>`: Filter by tag.
  - `?search=<text>`: Case-insensitive search across title, excerpt, and content.
  - `?authorId=<id>`: Filter by author.
- `GET /api/posts/:identifier` — Fetch a post by its ID or slug (automatically tracks read count).
- `POST /api/posts/:id/view` — Increment view/read counter for a post.
- `POST /api/posts` — Publish a new entry *(Requires authentication)*.
  - Body:
    ```json
    {
      "title": "Entry Title",
      "body": "Paragraph text...\n\n@@MARGIN:Margin note text@@",
      "categorySlug": "essays",
      "tags": ["essays", "craft"],
      "cover": { "from": "#55643E", "to": "#3E4A2C" }
    }
    ```
- `PUT /api/posts/:id` — Update existing post *(Requires author authentication)*.
- `DELETE /api/posts/:id` — Delete post and associated comments *(Requires author authentication)*.

### Comments (`/api/posts/:postId/comments`)
- `GET /api/posts/:postId/comments` — Fetch comments for a post.
- `POST /api/posts/:postId/comments` — Add comment *(Requires authentication)*.
  - Body: `{ "content": "Thoughtful remark..." }`.
- `DELETE /api/comments/:commentId` (or `DELETE /api/posts/:postId/comments/:commentId`) — Delete comment *(Requires comment author authentication)*.
