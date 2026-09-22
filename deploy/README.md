# Iroto Realty on a Contabo VPS

Everything runs on one server with Docker Compose:

| Service | What it does |
|---|---|
| `caddy` | Public entry point on ports 80/443. Gets HTTPS certificates automatically, serves uploaded images from disk at `https://SITE_DOMAIN/media/...`, and forwards everything else to the apps. |
| `website` | Public site (Next.js). |
| `admin` | Admin panel (Next.js) with Better Auth email/password login. Writes uploaded images to `deploy/data/uploads`. |
| `db` | Postgres 17. Only reachable inside Docker, never from the internet. |

A Contabo **Cloud VPS 4** (4 vCPU, 8 GB RAM) is plenty. Choose Ubuntu 24.04.

The migration runs in three phases. The current Vercel + Supabase setup keeps serving the live site until the DNS switch in phase 2, and stays untouched for a week afterwards as a fallback.

---

## Phase 1: set up and test the VPS (about 1 hour, no downtime)

### 1. Prepare the server

SSH in as root, then:

```bash
apt-get update && apt-get install -y git
git clone https://github.com/joeglantern/Iroto-Realty.git /opt/iroto
bash /opt/iroto/deploy/scripts/setup-server.sh
```

This installs Docker, turns on the firewall (SSH, 80 and 443 only), enables automatic security updates and adds swap.

### 2. Add temporary DNS records

At whoever hosts the irotorealty.com DNS, add three **A records** pointing at the VPS IP:

- `new.irotorealty.com`
- `admin-new.irotorealty.com`
- `www.new.irotorealty.com` (keeps the automatic HTTPS setup happy)

While you are there, lower the TTL of the existing `@`, `www` and `admin` records to 300 seconds so the real switch later takes effect quickly. Write down their current values; they are the rollback.

### 3. Configure

```bash
cd /opt/iroto/deploy
cp .env.example .env
nano .env
```

- `SITE_DOMAIN=new.irotorealty.com` and `ADMIN_DOMAIN=admin-new.irotorealty.com` for now
- `POSTGRES_PASSWORD`: output of `openssl rand -hex 24`
- `BETTER_AUTH_SECRET`: output of `openssl rand -base64 32`
- `RESEND_API_KEY`: copy it from the Vercel website project's environment variables

### 4. Export from Supabase (on your laptop)

From the repo root on the machine that has `.env.local` with the Supabase credentials (needs Docker Desktop and Node 18+; on Windows use Git Bash):

```bash
bash deploy/scripts/export-supabase.sh
```

This creates `migration-export/` with the database, the login accounts and every uploaded image. It holds customer data and password hashes, so keep it private (it is gitignored). Copy it to the server:

```bash
scp -r migration-export root@VPS_IP:/opt/iroto/
```

### 5. Start and import (on the VPS)

```bash
cd /opt/iroto/deploy
docker compose up -d --build
bash scripts/import.sh /opt/iroto/migration-export
```

The import prints how many properties, posts and login accounts it loaded, and warns if any content still links to Supabase.

### 6. Test on the temporary domains

- https://new.irotorealty.com: home page, a property page, search, blog, travel pages, contact form (check that the email arrives)
- https://admin-new.irotorealty.com: sign in with the **existing admin email and password** (they were migrated), edit something, upload an image, then check that it shows on the site

### 7. Turn on nightly backups

```bash
(crontab -l 2>/dev/null; echo "30 2 * * * /bin/bash /opt/iroto/deploy/scripts/backup.sh >> /var/log/iroto-backup.log 2>&1") | crontab -
```

Backups go to `/var/backups/iroto` (14 days kept). They are on the same disk, so also enable Contabo snapshots or copy that folder off the server regularly.

---

## Phase 2: cutover (about 30 minutes, pick a quiet time)

1. Ask everyone to stop editing in the admin until you confirm the switch.
2. **Fresh export** on your laptop: `bash deploy/scripts/export-supabase.sh` (images already downloaded are skipped), then copy it again:
   `scp -r migration-export root@VPS_IP:/opt/iroto/`
3. **Re-import** on the VPS, replacing the test data:
   ```bash
   cd /opt/iroto/deploy
   FORCE=1 bash scripts/import.sh /opt/iroto/migration-export
   ```
4. **Switch domains** in `.env`: `SITE_DOMAIN=irotorealty.com`, `ADMIN_DOMAIN=admin.irotorealty.com`, then rebuild (the image address is built into the apps):
   ```bash
   docker compose up -d --build
   ```
5. **Switch DNS**: point the `@`, `www` and `admin` A records to the VPS IP, and remove any Vercel A/CNAME records for them. **Leave the email records (MX, SPF/TXT, DKIM for Resend) exactly as they are.** Caddy fetches the HTTPS certificates by itself within a minute or two of DNS reaching the server.
6. Run the phase 1 test list again on the real domains.

**Rollback:** point the three DNS records back to the values you wrote down. Vercel and Supabase are unchanged, so the old site comes straight back.

---

## Phase 3: clean up (after about a week)

- Check the old Supabase `contact_inquiries` table for any message that arrived between the final export and the DNS switch, and forward it.
- Remove the domains from the two Vercel projects, then delete or pause the Supabase project. This also retires the Supabase keys that were once committed to this public repository.
- Delete the `new`, `www.new` and `admin-new` DNS records.
- Delete `migration-export/` from your laptop and the server once a backup has run.

---

## Day-to-day

| Task | Command (in `/opt/iroto/deploy`) |
|---|---|
| Deploy new code | `git pull && docker compose up -d --build` |
| Add an admin, or reset a password | `docker compose exec admin node scripts/create-admin.mjs person@irotorealty.com "Full Name"` (asks for the password) |
| Logs | `docker compose logs -f website` (or `admin`, `caddy`, `db`) |
| Restart everything | `docker compose restart` |
| Manual backup | `bash scripts/backup.sh` |
| Restore a database backup | `docker compose exec -T db pg_restore -U iroto -d iroto --clean --if-exists < /var/backups/iroto/db-YYYY-MM-DD_HHMM.dump` |

Admin accounts can only be created with the command above; there is no public sign-up. Create any extra admins **after** the final cutover import, because `FORCE=1` replaces all accounts with the ones exported from Supabase.
