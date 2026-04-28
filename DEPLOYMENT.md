# Deployment Guide (Vercel + PostgreSQL)

This project is a Next.js app with Prisma, configured for PostgreSQL.

Current local DB URL example:

`postgresql://postgres:admin123@localhost:5432/gymdb?schema=public`

For production on Vercel, use a hosted PostgreSQL provider (Neon, Supabase, RDS, etc.), not localhost.

## 1) Prerequisites

- GitHub account (repo pushed)
- Vercel account
- Hosted PostgreSQL database

## 2) PostgreSQL Setup

1. Create a PostgreSQL database (example name: `gymdb`).
2. Ensure `prisma/schema.prisma` has:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Set your local `.env` connection:

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/gymdb?schema=public"
```

4. Apply schema and generate client:

```bash
npx prisma db push
npx prisma generate
```

5. (Optional) Seed data:

```bash
npm run db:seed
```

## 3) Push Code to GitHub

```bash
git add .
git commit -m "prepare PostgreSQL deployment"
git push
```

## 4) Import Project in Vercel

1. Open [https://vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects **Next.js**

## 5) Configure Environment Variables (Vercel)

In Vercel Project Settings -> Environment Variables, add:

- `DATABASE_URL` = hosted PostgreSQL URL (not localhost)
- `NEXTAUTH_SECRET` = long random secret
- `NEXTAUTH_URL` = production URL (e.g. `https://your-app.vercel.app`)
- `WHATSAPP_TOKEN` (if WhatsApp enabled)
- `WHATSAPP_PHONE_NUMBER_ID` (if WhatsApp enabled)
- `ESSL_DEVICE_KEY` (if ESSL endpoint used)

Notes:
- Never commit production secrets to git.
- Keep `.env` for local development only.

## 6) Build and Deploy

`package.json` already contains:

- `build`: `prisma generate && next build`

So default Vercel build command works.

Deploy by:
- Triggering from Vercel dashboard, or
- Pushing to the connected branch.

## 7) Post-Deploy Checks

Verify:

- `/admin/login` works
- Manager vs super-admin redirects are correct
- Members/Plans/Payments CRUD works
- Payment type (FULL/PARTIAL) is saved and visible
- Invoice open/download works
- Pending payments page works
- Public site pages load

## 8) Common Issues

### Prisma EPERM error on Windows (local)

If `npx prisma generate` fails with EPERM:

1. Stop dev server (`npm run dev`)
2. Run:

```bash
npx prisma generate
```

3. Start dev server again

### Vercel cannot connect to DB

Check:

- `DATABASE_URL` is from hosted PostgreSQL
- Host allows external connections
- SSL requirements match provider (often required)
- DB user has schema permissions

### Auth callback/login loop

Check:

- `NEXTAUTH_URL` exactly matches deployed domain
- `NEXTAUTH_SECRET` is set
- No stale old env values in Vercel

## 9) Recommended Release Flow

1. Test locally with PostgreSQL
2. Push branch
3. Deploy preview on Vercel
4. Validate admin/payment/invoice flows
5. Promote to production

