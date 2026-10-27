# The DevLogger — Frontend Application

A long-form publication web app featuring journal-style browsing, marginalia commentary rails, live search, dynamic category and tag filtering, view count metrics, and author ownership controls.

Connected dynamically to the Express + Prisma + PostgreSQL backend API.

---

## Tech Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Bundler & Dev Server**: Vite
- **Icons**: Lucide React
- **API Communication**: Native Fetch with credentials & Bearer JWT support

---

## Features
- **Zero Local Storage / In-Memory Mocking**: All data (posts, authors, comments, categories, read counts) is persisted and served dynamically by the PostgreSQL backend.
- **Publication Journal Layout**:
  - Featured latest article with gradient cover art.
  - Journal index listing with date, read time, and comment counters.
  - Category navigation tabs populated dynamically from the database.
- **Marginalia Reading Experience**:
  - Clean typographic column paired with a dedicated margin annotation rail.
  - Syntax parser converts `@@MARGIN:...@@` into side annotations beside relevant paragraphs.
- **Interactive Reflections & Comments**:
  - Threaded comment section on each entry.
  - Authenticated authors can post new reflections and delete their own remarks.
- **Authoring Studio**:
  - Dual-mode "Write" and "Preview" editor.
  - Category selection, custom tags, and gradient cover styling.
  - One-click marginal note insertion helper.
  - Author-only editing and post deletion.
- **Authentication**:
  - Secure login and registration with validation feedback.
  - Session recovery on refresh via `/api/auth/me`.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
The frontend communicates by default with `http://localhost:8080/api`. To customize:
Create `.env` in `frontend/`:
```env
VITE_API_URL="http://localhost:8080/api"
```

### 3. Run the Development Server
```bash
npm run dev
```

Open the printed URL (typically `http://localhost:5173`).

---
