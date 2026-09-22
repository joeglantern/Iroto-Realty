#!/usr/bin/env bash
# Load a Supabase export (made by export-supabase.sh) into the VPS database and media folder.
# Usage, from the deploy/ directory:  ./scripts/import.sh /path/to/migration-export
# Re-running on a database that already has data requires FORCE=1, which wipes it first.
set -euo pipefail
cd "$(dirname "$0")/.."

EXPORT_DIR="${1:?Usage: ./scripts/import.sh /path/to/migration-export}"
set -a; source ./.env; set +a

for f in db/public.sql db/auth_users.csv; do
  [ -f "$EXPORT_DIR/$f" ] || { echo "Missing $EXPORT_DIR/$f"; exit 1; }
done

psql() { docker compose exec -T db psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"; }

if [ "$(psql -tAc "select to_regclass('public.properties') is not null")" = "t" ]; then
  if [ "${FORCE:-}" != "1" ]; then
    echo "The database already contains data. Re-run with FORCE=1 to wipe it and import again."
    exit 1
  fi
  echo "FORCE=1: wiping existing data"
fi
psql -c 'drop schema if exists public cascade; drop schema if exists auth cascade; create schema public;'

echo "1/5 Supabase compatibility layer"
psql < db/00-compat.sql

echo "2/5 Login accounts"
psql -c '\copy auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, last_sign_in_at) from stdin with csv header' < "$EXPORT_DIR/db/auth_users.csv"

echo "3/5 Tables and data"
sed '/^CREATE SCHEMA public;$/d' "$EXPORT_DIR/db/public.sql" | psql

echo "4/5 Better Auth tables and account migration"
psql < db/10-better-auth.sql
psql < db/20-finalize.sql

echo "5/5 Uploaded images"
mkdir -p data/uploads
if [ -d "$EXPORT_DIR/storage" ]; then
  cp -a "$EXPORT_DIR/storage/." data/uploads/
  echo "   $(find data/uploads -type f | wc -l) files in data/uploads"
else
  echo "   No storage folder in the export, skipping"
fi
# The admin container writes uploads as uid 1001.
chown -R 1001:1001 data/uploads

SUPABASE_LINKS=$(grep -o 'https://[a-z0-9]*\.supabase\.co[^"'"'"' )<]*' "$EXPORT_DIR/db/public.sql" | sort -u || true)
if [ -n "$SUPABASE_LINKS" ]; then
  echo
  echo "WARNING: the content contains links to Supabase that will break once Supabase is shut down:"
  echo "$SUPABASE_LINKS" | head -20
  echo "Edit those posts/pages in the admin to re-upload the images."
  echo
fi

psql -tAc "select 'Imported: ' || (select count(*) from properties) || ' properties, ' || (select count(*) from blog_posts) || ' blog posts, ' || (select count(*) from \"user\") || ' login accounts'"
