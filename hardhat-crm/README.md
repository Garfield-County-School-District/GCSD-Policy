# Hard Hat CRM

A lightweight CRM for **Hard Hat Consulting** — a bookkeeping firm specializing in
construction contractors (roofing, paving, landscaping, HVAC, specialty trades).
The pipeline and fields mirror Hard Hat's real funnel:

> **New Lead → Discovery Call → Financial Inspection → Proposal Sent → Won / Lost**

## What it does

- **Companies** — track contractor businesses as prospects / active clients / churned, with trade, preferred language (EN/ES), accounting software, revenue, and notes.
- **Contacts** — people at each company.
- **Pipeline** — drag-and-drop kanban of deals across the funnel, with estimated monthly value and service type (Financial Inspection, 90-Day Restructure, Cleanup, Ongoing Bookkeeping, Profit Strategy).
- **Activity log** — log calls, emails, meetings, and notes against a company.
- **Tasks** — follow-ups with due dates and overdue flagging.
- **Dashboard** — client/prospect counts, pipeline value, MRR won, tasks due, and recent activity.

## Tech stack

- **Frontend:** Vite + React + TypeScript + React Router
- **Backend:** Supabase (Postgres + Auth + row-level security) — no custom server code
- **Auth:** email/password for a small internal team

## Live backend (already provisioned)

A Supabase project is already set up and seeded:

- **Project ref:** `vbzlxltvmjqoxrtunysk`
- **API URL:** `https://vbzlxltvmjqoxrtunysk.supabase.co`
- **Publishable key:** `sb_publishable_Pz2T9yU9t4xVcCck8aQNeA_v40mzz_C` (safe for the browser)
- **Test login:** `admin@hardhat.test` / `hardhat123`

These values are already in `.env` (gitignored). Just `npm install && npm run dev`.
Manage the project at https://supabase.com/dashboard/project/vbzlxltvmjqoxrtunysk

To add real team members: **Authentication → Users → Add user** (or change the
test user's password). Then delete the `admin@hardhat.test` test account.

## Setup (from scratch / new environment)

### 1. Create the Supabase project & schema

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) for sample data.
4. Create team logins under **Authentication → Users → Add user** (email + password).

### 2. Configure the app

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Project Settings → API
```

### 3. Run

```bash
npm install
npm run dev      # http://localhost:5174
```

### 4. Build / deploy

```bash
npm run build    # outputs to dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages). Supabase is
already hosted, so there's no separate backend to deploy.

## Moving this into its own repository

This project is self-contained in the `hardhat-crm/` folder. To split it out:

```bash
# from inside hardhat-crm/
git init
git add .
git commit -m "Initial commit: Hard Hat CRM"
git branch -M main
git remote add origin git@github.com:<you>/hardhat-crm.git
git push -u origin main
```

## Notes / next steps

- RLS currently grants any signed-in staff member full access (shared workspace).
  Tighten to per-owner or role-based access if you later add client-facing views.
- `src/lib/types.ts` is hand-written; regenerate from the live schema with the
  Supabase CLI once the project exists.
- Ideas: email reminders for due tasks, contractor-specific report exports,
  QuickBooks integration, Spanish UI toggle (you already store `preferred_language`).
