# CineTube Frontend

Frontend application for CineTube built with Next.js App Router. It delivers the public streaming-style experience, auth screens, profile and watchlist flows, admin dashboard, discovery pages, and the floating AI assistant UI.

## Live

- App: `https://cinetube-self.vercel.app`
- Backend API: `https://cinetube-backend.onrender.com/api`

## Core Features

- Responsive homepage with trending, top-rated, newly added, and AI picks
- Advanced search and explore page with filters
- Movie and series detail pages
- Watchlist, purchase history, and subscription-aware profile page
- Login, registration, Google sign-in, forgot/reset password flows
- Admin dashboard UI for review moderation and analytics
- Static support pages: About, Contact, FAQ, Privacy, Terms, Blog
- Floating AI assistant with Groq-backed responses and local fallback UX

## Demo Credentials

Frontend login currently exposes quick demo buttons for `USER` and `ADMIN`, while the backend also supports `MODERATOR` and `CURATOR`.

| Role | Email | Password |
| --- | --- | --- |
| User | `demo-user@cinetube.com` | `User123!` |
| Admin | `demo-admin@cinetube.com` | `Admin123!` |
| Moderator | `demo-moderator@cinetube.com` | `Moderator123!` |
| Curator | `demo-curator@cinetube.com` | `Curator123!` |

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Styling | Tailwind CSS 4 |
| API Client | Axios |
| Payments | Stripe Elements |
| Auth UX | Google OAuth, local auth screens |
| UI Feedback | React Hot Toast |

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
```

### 3. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important Notes

- Do not put Groq, Stripe secret, TMDB, or JWT secrets in the frontend
- If production API URL changes, redeploy the frontend after updating `NEXT_PUBLIC_API_URL`
- The AI assistant UI depends on the backend `/api/ai/*` routes

## Project Structure

```text
src/app          app router pages and layouts
src/components   shared UI, cards, home, AI assistant
src/content      static content and nav definitions
src/context      auth session store
src/lib          axios client and helpers
```

## License

MIT
