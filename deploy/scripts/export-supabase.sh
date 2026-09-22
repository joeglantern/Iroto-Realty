#!/usr/bin/env bash
# Export everything from the current Supabase project into ./migration-export at the repo root:
#   db/full-supabase-backup.dump  complete pg_dump of the Supabase database (keep as a safety copy)
#   db/public.sql                 tables, data, functions and triggers that import.sh restores
#   db/auth_users.csv             login accounts (email + bcrypt password hash)
#   storage/<bucket>/...          every uploaded image
# Needs Docker and Node 18+. Reads credentials from the repo root .env.local.
# Run from the repo root:  bash deploy/scripts/export-supabase.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

read_env() { grep -E "^$1=" .env.local | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }
export DBURL="$(read_env DATABASE_URL)"
export SUPABASE_URL="$(read_env NEXT_PUBLIC_SUPABASE_URL)"
export SUPABASE_SERVICE_ROLE_KEY="$(read_env SUPABASE_SERVICE_ROLE_KEY)"
for v in DBURL SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY; do
  [ -n "${!v}" ] || { echo "Missing $v in .env.local"; exit 1; }
done

OUT="$PWD/migration-export"
mkdir -p "$OUT/db" "$OUT/storage"
# Docker Desktop on Windows needs C:/... paths; pwd -W gives that under Git Bash.
DB_MOUNT="$(cd "$OUT/db" && (pwd -W 2>/dev/null || pwd))"

echo "1/3 Database dumps (Postgres 17 client in Docker)"
MSYS_NO_PATHCONV=1 docker run --rm -e DBURL -v "$DB_MOUNT:/out" postgres:17 sh -c '
  set -e
  pg_dump "$DBURL" -Fc -f /out/full-supabase-backup.dump
  pg_dump "$DBURL" --schema=public --no-owner --no-privileges -f /out/public.sql
  psql "$DBURL" -v ON_ERROR_STOP=1 -qc "\copy (select id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, last_sign_in_at from auth.users) to /out/auth_users.csv csv header"
'

echo "2/3 Storage files"
node deploy/scripts/export-storage.mjs "$OUT/storage"

echo "3/3 Summary"
echo "   public.sql: $(wc -c < "$OUT/db/public.sql") bytes"
echo "   login accounts: $(($(wc -l < "$OUT/db/auth_users.csv") - 1))"
echo "   storage files: $(find "$OUT/storage" -type f | wc -l)"
echo
echo "Done. migration-export/ contains customer data and password hashes: keep it private and never commit it."
