#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu 24.04 Contabo VPS. Run as root:
#   curl -fsSL https://raw.githubusercontent.com/joeglantern/Iroto-Realty/main/deploy/scripts/setup-server.sh | bash
# or, after cloning the repo:  bash /opt/iroto/deploy/scripts/setup-server.sh
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a

APT_OPTS=(-y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold)
apt-get update
apt-get "${APT_OPTS[@]}" upgrade
apt-get "${APT_OPTS[@]}" install ca-certificates curl git ufw unattended-upgrades

# Docker Engine + Compose plugin
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

# Firewall: SSH and web only. Postgres is never exposed; it is reachable only inside Docker.
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

# Automatic security updates
dpkg-reconfigure -f noninteractive unattended-upgrades

# 2 GB swap as a safety net while the Next.js apps build
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# The code
if [ ! -d /opt/iroto ]; then
  git clone https://github.com/joeglantern/Iroto-Realty.git /opt/iroto
fi
chmod +x /opt/iroto/deploy/scripts/*.sh

# Uploaded images; the admin container writes them as uid 1001
mkdir -p /opt/iroto/deploy/data/uploads
chown -R 1001:1001 /opt/iroto/deploy/data/uploads

echo
echo "Server ready. Next: cp /opt/iroto/deploy/.env.example /opt/iroto/deploy/.env and fill it in."
