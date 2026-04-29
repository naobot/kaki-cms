# Kaki CMS

A lightweight, self-hosted CMS for developers managing static portfolio websites on behalf of clients. Kaki replaces third-party solutions like Forestry.io and Netlify CMS with a single, independently deployable app that connects to any number of GitHub-backed client repositories.

## Overview

Kaki is a standalone Next.js application — you deploy it once, and it serves as the editing interface for all of your clients' repos. Editors log in at your CMS URL rather than at each client's domain.

**For developers (you):** GitHub OAuth login. You connect client repos, manage projects, and configure what editors can see and edit via a `cms.config.json` file that lives in each client's repo.

**For editors (your clients):** Email/password login. They see a clean editing UI driven entirely by the repo's config — no GitHub account or technical knowledge required.

Content is stored as files in the client's GitHub repository. Saving a document commits directly to the repo, which triggers a rebuild of the static site automatically via Vercel's GitHub integration.

## Architecture at a Glance

- **Auth & data:** Supabase (authentication, user/project data, row-level security for tenant isolation)
- **Content layer:** GitHub API — each developer connects their own GitHub account via GitHub OAuth; the client's repo is the database
- **Config:** A `cms.config.json` in each client repo defines the editing schema, fetched at runtime
- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS)

---

## Developer Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A GitHub account and a registered [GitHub OAuth App](https://github.com/settings/developers)
- A deployment target (e.g. [Vercel](https://vercel.com))

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/kaki-cms.git
cd kaki-cms
npm install
```

---

### 2. Set up Supabase

1. Create a new Supabase project.
2. Run the initial schema migration found at `supabase/migrations/001_initial_schema.sql` using the Supabase dashboard's SQL editor or the Supabase CLI.
3. In your Supabase project, go to **Authentication → Providers** and enable **GitHub** as a provider. You'll need to paste in your GitHub OAuth app's Client ID and Secret (see step 3).

---

### 3. Create a GitHub OAuth App

Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**.

Set the following:

| Field | Value |
|---|---|
| Homepage URL | Your CMS URL (e.g. `https://your-cms.vercel.app`) |
| Authorization callback URL | `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback` |

Note your **Client ID** and generate a **Client Secret** — you'll need these for Supabase (step 2) and your environment variables (step 4).

---

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-supabase-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- The **publishable key** is found in Supabase under **Project Settings → API → Project API keys** (`anon` / `publishable`).
- The **service role key** is on the same page — keep this secret and never expose it client-side.

---

### 5. Configure Supabase auth redirect URLs

In your Supabase dashboard, go to **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (update to your production URL when deploying)
- **Redirect URLs:** Add `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/confirm`

---

### 6. Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

Log in with your GitHub account to create the first developer account and start connecting repos.

---

### 7. Deploying to production

#### Vercel

1. Push the repository to GitHub and import it as a new project in Vercel.
2. Add the following environment variables in your Vercel project settings, updating `NEXT_PUBLIC_SITE_URL` to your production CMS URL:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
```

3. Update your Supabase auth redirect URLs (as in step 5) to include your production CMS URL.
4. Trigger a deployment. No changes to your GitHub OAuth App are needed — the callback URL points directly to Supabase and does not change.

---

## Connecting a client repo

Once logged in as a developer:

1. Add a `cms.config.json` to the root of the client's GitHub repository. This file defines the collections and fields that editors will see. Refer to the config documentation for the schema.
2. In Kaki, connect the repo via the dashboard. Kaki fetches the config at runtime — no redeployment of the CMS is required when the config changes.
3. Invite the client as an editor using their email address. They'll receive a confirmation email and can log in without a GitHub account.

---

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Supabase](https://supabase.com) (auth, database, RLS)
- [GitHub API](https://docs.github.com/en/rest) (content/Git layer)
- [Tailwind CSS](https://tailwindcss.com)
