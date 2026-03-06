# blog-app

A minimal personal blog with full CRUD — built with Next.js 14, TypeScript, and Tailwind.
Inspired by the aesthetic of [makesomething.so](https://www.makesomething.so/).

## Features

- **Landing page** with hero intro + post list
- **Category filter** — filter posts by topic inline
- **Blog CRUD** — create, read, edit, delete posts
- **Categories CRUD** — manage categories with post counts
- **localStorage persistence** — no backend needed, data lives in the browser
- **Lora + DM Sans** typography for that editorial feel
- Staggered fade-up animations throughout

## Pages

| Route | Description |
|---|---|
| `/` | Landing page + post list + category filter |
| `/blog/new` | Create new post |
| `/blog/[id]` | Read a post |
| `/blog/[id]/edit` | Edit a post |
| `/categories` | Manage categories |

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customise

1. **Your name/bio** — edit `app/page.tsx`, the hero section at the top
2. **Default posts** — edit `lib/store.ts`, the `defaultPosts` array
3. **Default categories** — edit `lib/store.ts`, the `defaultCategories` array
4. **Fonts** — edit `app/globals.css`, the Google Fonts import

## Upgrade paths

- Swap `localStorage` for a real database (Postgres + Prisma, Supabase, etc.) by replacing the functions in `lib/store.ts`
- Add auth with NextAuth.js to make the admin actions protected
- Add MDX support for richer post content
