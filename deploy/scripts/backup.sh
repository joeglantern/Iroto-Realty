#!/usr/bin/env bash
# Nightly backup of the database and uploaded images, keeping the last 14 days.
# Install on the server with:  (crontab -l 2>/dev/null; echo "30 2 * * * /bin/bash /opt/iroto/deploy/scripts/backup.sh >> /var/log/iroto-backup.log 2>&1") | crontab -
# These backups live on the same disk: also copy /var/backups/iroto off the server regularly.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source ./.env; set +a

DEST=/var/backups/iroto
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p "$DEST"

docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$DEST/db-$STAMP.dump"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C data uploads

find "$DEST" -type f -mtime +14 -delete
echo "$(date -Is) backup ok: $(du -sh "$DEST" | cut -f1) in $DEST"
