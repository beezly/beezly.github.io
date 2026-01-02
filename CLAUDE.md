# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal blog/website for Andrew Beresford (beezly) hosted on GitHub Pages at beez.ly. The site is built with Astro using the Ryze theme and deployed via GitHub Actions.

**Migration Note**: This site was migrated from Jekyll to Astro in January 2026. The previous custom Astro implementation is archived in `_astro_backup/`, and original Jekyll files are in `_jekyll_backup/`.

## Development Commands

### Local Development
```bash
npm install              # Install dependencies
npm run dev             # Start local development server (http://localhost:4321)
npm run build           # Build site to dist/ directory
npm run preview         # Preview production build locally
```

### Deployment
The site auto-deploys to GitHub Pages when changes are pushed to the `master` branch via GitHub Actions (`.github/workflows/deploy.yml`).

## Repository Structure

### Content
- `src/blog/` - Blog posts in markdown format with YAML front matter
  - Naming convention: `descriptive-slug.md` (date is in front matter)
  - Front matter includes: slug, title, description, date, author, tags, featured, editable
  - Migrated from Jekyll (see `_jekyll_backup/` for original files)

### Layouts & Components (Ryze Theme)
- `src/layouts/BaseLayout.astro` - Base HTML layout with header, footer, dark mode, and GoatCounter analytics
- `src/layouts/BlogLayout.astro` - Blog post layout with reading progress bar, metadata, and tags
- `src/components/Header.astro` - Site header with navigation, theme toggle, and RSS link
- `src/components/Navigation.astro` - Navigation menu (archive, tags, projects)
- `src/components/Footer.astro` - Site footer with social links and copyright
- `src/components/Socials.astro` - Social media links (LinkedIn, GitHub)
- `src/components/Introduction.astro` - Homepage introduction/bio section (describes site as "archive" of technical posts)
- `src/components/Featured.astro` - Recent posts section (shows 5 most recent posts with excerpts, not just featured)
- `src/components/FeatureCard.astro` - Card component for displaying posts with title, date, tags, and excerpt
- `src/components/PostCard.astro` - Reusable post card component with animations (used in archive/tag pages)
- `src/components/ThemeToggle.tsx` - React component for dark/light mode toggle
- `src/components/ProgressBar.tsx` - React component for reading progress indicator
- `src/components/Title.astro` - Blog post title component with date and tags
- `src/components/Year.astro` - Archive year grouping component

### Pages
- `src/pages/index.astro` - Homepage with Introduction and Recent Posts sections (no newsletter)
- `src/pages/projects.astro` - Projects page listing external projects and documentation
- `src/pages/404.astro` - Custom 404 error page with back-to-home link
- `src/pages/[...slug].astro` - Dynamic routes for blog posts (URL: `/slug/`)
- `src/pages/archive/[page].astro` - Paginated archive of all posts
- `src/pages/archive/[year]/[page].astro` - Paginated archive by year
- `src/pages/tags/index.astro` - Tag listing page
- `src/pages/tags/[tag]/[page].astro` - Paginated posts by tag
- `src/pages/[year]/[month]/[day]/[slug].astro` - 301 redirects from old Jekyll directory URLs
- `src/pages/YYYY/MM/DD/slug.html.ts` - 301 redirects from old Jekyll .html URLs (hardcoded for each post)
- `src/pages/rss.xml.ts` - RSS feed generator (TypeScript)
- `src/pages/robots.txt.ts` - Dynamic robots.txt generator

### Configuration
- `astro.config.mjs` - Astro configuration (site URL, integrations, markdown/Shiki config, React)
- `src/content.config.ts` - Content Collections schema with TypeScript types (uses "blogs" collection)
- `src/styles/global.css` - Global styles with Tailwind imports and dark mode theming
- `src/styles/typography.css` - Markdown content typography styles
- `.env` - Environment variables (PUBLIC_GOATCOUNTER_CODE, PUBLIC_SITE_URL)

### Static Assets
- `public/` - Static files served at root
  - `CNAME` - Custom domain configuration (beez.ly)
  - `favicon.svg` - Site favicon
  - `fonts/` - Web fonts

## Writing Blog Posts

Create new posts in `src/blog/` with descriptive filenames like `descriptive-slug.md`.

Required front matter:
```yaml
---
slug: "descriptive-slug"
title: "Post Title"
description: "Post description"
date: 2024-01-01
author: "Andrew Beresford"
tags: ["tag1", "tag2"]
featured: false
editable: false
---
```

### Code Blocks
Use standard markdown code fences with language syntax:
````markdown
```javascript
const example = 'code here';
```
````

### Excerpts
Use `<!--more-->` to mark the excerpt cutoff point for the homepage listing.

## Third-Party Integrations

- **Analytics**: GoatCounter - privacy-focused, configured via `.env` file, enabled in production only
- **Deployment**: GitHub Actions → GitHub Pages (automated on push to master)

## Technology Stack

- **Framework**: Astro 5.x (static site generator)
- **Theme**: Ryze (https://astro.build/themes/details/ryze/) - minimalist blog starter
- **Styling**: Tailwind CSS 4.x with custom theme and typography styles
- **Content**: Markdown with Content Collections (type-safe, using "blogs" collection)
- **Integrations**: React, Sitemap, RSS, SVG loader
- **Syntax Highlighting**: Shiki with dual themes (github-light-high-contrast for light, github-dark for dark mode)
- **Fonts**: Space Grotesk Variable (sans), IBM Plex Mono (mono)
- **Node**: 20.x
- **Package Manager**: npm

## Astro-Specific Features

- **Dark Mode**: Theme toggle component with localStorage persistence and system preference detection
- **Content Collections**: Type-safe blog posts with Zod schema validation (using "blogs" collection)
- **Server Redirects**: Old Jekyll URLs redirect via Astro's `redirect()` function (301)
- **Environment Variables**: Uses `.env` for configuration (PUBLIC_GOATCOUNTER_CODE, PUBLIC_SITE_URL)
- **React Islands**: ThemeToggle and ProgressBar components use React for client-side interactivity
- **TypeScript**: Full TypeScript support for pages, components, and API routes
- **Reading Progress**: Visual progress bar component for blog posts
- **Archive System**: Posts organized by year with pagination
- **Tag System**: Posts filterable by tags with dedicated pages
- **Featured Posts**: Ability to feature posts on homepage

## URL Structure

- Homepage: `/`
- Projects: `/projects` - Lists external projects and documentation
- Blog posts: `/slug/` (e.g., `/managing-unifi-content-filters-with-cli-tool/`)
- Archive (all): `/archive/1/` (paginated)
- Archive (by year): `/archive/2018/1/` (paginated)
- Tags (listing): `/tags/`
- Tags (filtered): `/tags/terraform/1/` (paginated)
- Old Jekyll URLs (`/YYYY/MM/DD/slug.html` and `/YYYY/MM/DD/slug/`) redirect to new structure
- RSS feed: `/rss.xml`
- Robots: `/robots.txt`

## Site Content & Organization

### Blog Posts (5 total)
1. **Managing Unifi Content Filters with CLI tool** (2026-01-02) - Featured ✓ (shown on homepage)
   - Tags: unifi, network, python, dns
   - About sync_unifi_filters Python CLI tool
2. **Authenticating Azure users with Hashicorp Vault** (2018-07-25)
   - Tags: hashicorp, vault, azure
3. **Provisioning VMs Using Ephemeral SSH Keys in Terraform** (2018-04-11)
   - Tags: terraform, ssh, azure
4. **Migrating LVM logical volume without downtime** (2014-06-02)
   - Tags: linux, lvm, storage
5. **Building CAS environment with CASinoApp** (2014-05-15)
   - Tags: cas, ruby, development

**Note**: Only the 2026 post is featured and appears on homepage. Older posts (2014-2018) are archived but accessible via archive/tags pages.

### Homepage Structure
- **Introduction**: Bio stating site is "an archive of technical posts"
- **Recent Posts**: Shows only featured posts with:
  - Currently: Only 2026 Unifi post (old posts unfeatured)
  - Title, date, read time
  - Content excerpt (extracted before `<!--more-->` marker or first paragraph)
  - Tags (shown on hover)
  - Grid layout (single column for readability)
- **No Newsletter Section**: Removed entirely

### Navigation
- **archive** - All posts paginated
- **tags** - Browse posts by tag
- **projects** - External projects and documentation

### External Projects
- **Unifi APIs Documentation** (https://beez.ly/unifi-apis)
  - Comprehensive API documentation for Ubiquiti Unifi Network Controllers

## Important Notes

- **Migration**: Migrated from Jekyll to Astro in January 2026, then to Ryze theme (original Jekyll in `_jekyll_backup/`)
- **Theme**: Uses Ryze theme as base with customizations (site name, social links, analytics, content)
- **Comments**: No comments system (never re-added after migration)
- **Social**: LinkedIn and GitHub links only (YouTube, Discord, Twitter removed from Ryze defaults)
- **Newsletter**: Completely removed (not just unconfigured)
- **Featured Posts**: Only 1 post marked as featured (2026 Unifi post) - old posts unfeatured to keep homepage current
- **Recent Content**: Homepage shows only 2026 content, older posts accessible via archive
- **Content Collections**: Provide TypeScript type safety for all blog posts (using "blogs" collection)
- **Blog Focus**: All content is technical/platform engineering focused
- **Performance**: Site uses minimal JavaScript - React islands for theme toggle and progress bar, otherwise static HTML/CSS
- **Domain**: Custom domain (beez.ly) configured via CNAME file in public/
- **Language**: Use British English
- **Analytics**: GoatCounter only loads in production (not development)
- **Redirects**: Both `/YYYY/MM/DD/slug/` and `/YYYY/MM/DD/slug.html` redirect to new URLs
- **Favicon**: Custom "AB" initials favicon matching site color scheme
