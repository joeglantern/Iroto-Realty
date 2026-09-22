# Iroto Realty - Deployment Guide

The website, admin panel, database and uploaded images all run on a single VPS with Docker Compose.

See [deploy/README.md](deploy/README.md) for server setup, migrating the data from Supabase, the DNS cutover, backups and day-to-day commands.

## Project Structure
- `/website` - Public-facing website (Next.js)
- `/admin` - Admin dashboard for content management (Next.js, Better Auth)
- `/deploy` - Docker Compose stack, Caddy config, database setup and operations scripts

## Local development

1. Start a Postgres 17 database and load it with `deploy/scripts/import.sh`, or point at an existing one.
2. Copy `website/.env.example` and `admin/.env.example` to `.env.local` in each app and fill them in.
3. Run `npm run dev` in each app (the admin on port 3001 so the default media URL works).
4. Create an admin login: `node scripts/create-admin.mjs you@example.com "Your Name"` from `admin/` with `DATABASE_URL` set.
