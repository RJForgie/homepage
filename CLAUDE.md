# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog for Ryan Forgie (https://ryanforgie.com), built with Astro. The site features a content-driven architecture with two primary content types: posts (blog posts) and lists (curated collections).

## Development Commands

**Package Manager:** This project uses `pnpm` (enforced via preinstall script).

```bash
# Development
pnpm install              # Install dependencies
pnpm run dev              # Start dev server at localhost:4321
pnpm run preview          # Preview production build locally

# Build & Quality
pnpm run build            # Type-check with astro check, then build to ./dist/
pnpm run lint             # Run ESLint on src/**/*.{js,ts,astro}
pnpm run format           # Format all files with Prettier

# Content Creation
pnpm run new:post <slug>  # Create a new post in src/content/posts/
pnpm run new:list <slug>  # Create a new list in src/content/lists/
```

**Git hooks:** Husky pre-commit runs `lint-staged` (format + lint) then `astro check` (type-check).

## Architecture

### Content System

The site uses Astro's content collections API with two collections defined in `src/content/config.ts`:

- `posts/` - Blog posts and articles
- `lists/` - Curated lists and resources

Both collections share a common schema: `title`, `description`, `pubDate`, and optional `updatedDate`.

### Routing

- **Homepage** (`src/pages/index.astro`): Displays lists of posts, lists, and projects
- **Dynamic content routes** (`src/pages/[...slug].astro`): Catch-all route that handles both collections using the pattern `{collection}/{slug}` (e.g., `/posts/running-a-link-blog`, `/lists/favourite-blogs`)
- **Project pages** (`src/pages/projects/`): Standalone project pages (e.g., `polya.astro`)
- **RSS feed** (`src/pages/rss.xml.js`): Auto-generated feed

### Layout Hierarchy

1. `BaseLayout.astro` - Root layout with SEO meta tags, Open Graph, and schema.org markup
2. `Post.astro` - Article-specific layout with ArticleMeta component and structured data

### Key Files

- `src/consts.ts` - Site-wide constants (SITE_TITLE, SITE_DESCRIPTION, AUTHOR)
- `astro.config.mjs` - Configured with MDX, sitemap, and TailwindCSS via Vite plugin

### TypeScript Path Aliases

Defined in `tsconfig.json` — use these for imports:

- `@consts` → `src/consts.ts`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@content/*` → `src/content/*`

### Styling

TailwindCSS v4 configured through Vite plugin. The site uses a dark theme with zinc color palette and typography plugin for prose styling.

## Content Creation

To add new content:

1. Create a markdown/MDX file in `src/content/posts/` or `src/content/lists/`
2. Include required frontmatter: `title`, `description`, `pubDate`
3. The dynamic `[...slug].astro` route will automatically generate the page

## Node Version

Minimum required: Node.js >= 18.20.8 (specified in package.json engines)
