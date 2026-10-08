#!/usr/bin/env bash
# Deploy / update Reelease AI on an Ubuntu server.
#
# First time:
#   git clone https://github.com/krishpanara/reelease.git /var/www/reelease
#   cd /var/www/reelease && sudo bash deploy.sh
#
# Update later (pulls latest code, rebuilds, restarts):
#   cd /var/www/reelease && sudo bash deploy.sh
#
# Optional overrides:  DOMAIN=...  CERTBOT_EMAIL=...  ADMIN_EMAIL=...  ADMIN_PASSWORD=...

set -euo pipefail

DOMAIN="${DOMAIN:-social.omfinitive.xyz}"
REPO_URL="${REPO_URL:-https://github.com/krishpanara/reelease.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/var/www/reelease}"
API_DIR="$APP_DIR/reelease-ai-api"
WEB_DIR="$APP_DIR/reelease-ai-next"
PORTS_FILE="$APP_DIR/.deploy-ports"
API_NAME="reelease-api"
WEB_NAME="reelease-web"
SITE_URL="https://$DOMAIN"

log()  { echo -e "\n\033[1;32m==> $*\033[0m"; }
warn() { echo -e "\033[1;33m[warn] $*\033[0m"; }
die()  { echo -e "\033[1;31m[error] $*\033[0m"; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root: sudo bash deploy.sh"
export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------- packages
log "Installing system packages"
apt-get update -y
apt-get install -y curl git gnupg ca-certificates iproute2 nginx certbot python3-certbot-nginx openssl

if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  log "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

# ---------------------------------------------------------------- ports
port_in_use() { ss -ltnH "( sport = :$1 )" 2>/dev/null | grep -q .; }

# Returns the first free port starting at $1, skipping $2 (the other app's port).
find_free_port() {
  local p=$1 skip=${2:-0}
  while port_in_use "$p" || [ "$p" -eq "$skip" ]; do
    echo "   port $p is busy, trying $((p + 1))" >&2
    p=$((p + 1))
  done
  echo "$p"
}

# ---------------------------------------------------------------- mongodb
# Reelease gets its own MongoDB 8 container (data in docker volume reelease-mongo),
# so it never shares a database with other apps on this server.
MONGO_CONTAINER="reelease-mongo"
command -v docker >/dev/null || { log "Installing Docker"; curl -fsSL https://get.docker.com | sh; }

if docker ps -a --format '{{.Names}}' | grep -qx "$MONGO_CONTAINER"; then
  docker start "$MONGO_CONTAINER" >/dev/null
  MONGO_PORT=$(docker port "$MONGO_CONTAINER" 27017/tcp | head -1 | awk -F: '{print $NF}')
else
  log "Starting MongoDB 8 in Docker"
  MONGO_PORT=$(find_free_port 27017)
  docker run -d --name "$MONGO_CONTAINER" --restart unless-stopped \
    -p "127.0.0.1:$MONGO_PORT:27017" -v reelease-mongo:/data/db mongo:8 >/dev/null
fi
echo "   MongoDB -> 127.0.0.1:$MONGO_PORT"
for i in $(seq 1 30); do
  docker exec "$MONGO_CONTAINER" mongosh --quiet --eval 'db.runCommand({ping:1}).ok' >/dev/null 2>&1 && break
  sleep 2
done

# ---------------------------------------------------------------- code
if [ -d "$APP_DIR/.git" ]; then
  log "Pulling latest code in $APP_DIR"
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
else
  log "Cloning $REPO_URL into $APP_DIR"
  mkdir -p "$(dirname "$APP_DIR")"
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

# ---------------------------------------------------------------- app ports
# Stop our own apps first so their old ports count as free again.
pm2 delete "$API_NAME" >/dev/null 2>&1 || true
pm2 delete "$WEB_NAME" >/dev/null 2>&1 || true
sleep 1

PREV_API=5000; PREV_WEB=3000
[ -f "$PORTS_FILE" ] && . "$PORTS_FILE" && PREV_API=${API_PORT:-5000} && PREV_WEB=${WEB_PORT:-3000}

log "Checking ports"
API_PORT=$(find_free_port "$PREV_API")
WEB_PORT=$(find_free_port "$PREV_WEB" "$API_PORT")
printf 'API_PORT=%s\nWEB_PORT=%s\n' "$API_PORT" "$WEB_PORT" > "$PORTS_FILE"
echo "   API -> $API_PORT   Web -> $WEB_PORT"

port_in_use 80 && ! ss -ltnpH "( sport = :80 )" | grep -q nginx && \
  warn "Port 80 is used by something other than nginx (apache?). Stop it or nginx will fail."

# ---------------------------------------------------------------- env files
# set_env FILE KEY VALUE  -> replace or append KEY=VALUE
set_env() {
  local file=$1 key=$2 val=$3
  touch "$file"
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$file"
  else
    echo "${key}=${val}" >> "$file"
  fi
}
get_env() { grep -E "^$2=" "$1" 2>/dev/null | head -1 | cut -d= -f2-; }

log "Writing API .env"
API_ENV="$API_DIR/.env"
FIRST_INSTALL=0
if [ ! -f "$API_ENV" ]; then
  FIRST_INSTALL=1
  cp "$API_DIR/.env.example" "$API_ENV"
fi
[ -n "$(get_env "$API_ENV" JWT_SECRET)" ]           || set_env "$API_ENV" JWT_SECRET "$(openssl rand -hex 48)"
[ -n "$(get_env "$API_ENV" TOKEN_ENCRYPTION_KEY)" ] || set_env "$API_ENV" TOKEN_ENCRYPTION_KEY "$(openssl rand -hex 48)"
[ -n "$(get_env "$API_ENV" SESSION_SECRET)" ]       || set_env "$API_ENV" SESSION_SECRET "$(openssl rand -hex 32)"

if [ "$FIRST_INSTALL" -eq 1 ]; then
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 18 | tr -d '/+=')}"
  set_env "$API_ENV" ADMIN_PASSWORD "$ADMIN_PASSWORD"
  set_env "$API_ENV" DEFAULT_USER_PASSWORD "$(openssl rand -base64 18 | tr -d '/+=')"
  [ -n "${ADMIN_EMAIL:-}" ] && set_env "$API_ENV" ADMIN_EMAIL "$ADMIN_EMAIL"
fi

# The web app owns /api on this domain, so the API's public files live under /backend.
set_env "$API_ENV" NODE_ENV production
set_env "$API_ENV" PORT "$API_PORT"
set_env "$API_ENV" APP_URL "$SITE_URL/backend"
set_env "$API_ENV" FRONTEND_URL "$SITE_URL"
set_env "$API_ENV" ALLOWED_ORIGINS "$SITE_URL"
set_env "$API_ENV" SERVER_ADDR "$(curl -fsS4 https://api.ipify.org || echo 127.0.0.1)"
set_env "$API_ENV" MONGODB_URI "mongodb://127.0.0.1:$MONGO_PORT/reelease-ai"

log "Writing web app .env.local"
WEB_ENV="$WEB_DIR/.env.local"
[ -f "$WEB_ENV" ] || cp "$WEB_DIR/.env.example" "$WEB_ENV"
# Next.js /api routes call the API server-side, so they can use the local port directly.
set_env "$WEB_ENV" NEXT_PUBLIC_API_BASE_URL "http://127.0.0.1:$API_PORT/api"
set_env "$WEB_ENV" NEXT_PUBLIC_STORAGE_URL "$SITE_URL/backend"
set_env "$WEB_ENV" NEXT_PUBLIC_SOCKET_URL "$SITE_URL"

# ---------------------------------------------------------------- build + run
log "Installing API dependencies"
cd "$API_DIR" && npm ci --omit=dev || npm install --omit=dev
mkdir -p "$API_DIR/uploads"

if [ "$FIRST_INSTALL" -eq 1 ]; then
  log "Seeding database (first install only)"
  npm run seed
fi

log "Installing web dependencies and building"
cd "$WEB_DIR" && (npm ci || npm install)
npm run build

log "Starting apps with PM2"
cd "$API_DIR" && PORT="$API_PORT" pm2 start server.js --name "$API_NAME" --update-env
cd "$WEB_DIR" && pm2 start npm --name "$WEB_NAME" -- start -- -p "$WEB_PORT" -H 127.0.0.1
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# ---------------------------------------------------------------- nginx
log "Configuring nginx for $DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 200M;

    # API static files / media  (https://$DOMAIN/backend/... -> API /...)
    location /backend/ {
        proxy_pass http://127.0.0.1:$API_PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # License installer and uploaded media are served by the API at the root too
    location ~ ^/(install|uploads)(/|\$) {
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://127.0.0.1:$WEB_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
    }
}
NGINX
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t
systemctl enable nginx
systemctl reload nginx || systemctl restart nginx

# ---------------------------------------------------------------- https
log "Setting up HTTPS"
if [ -n "${CERTBOT_EMAIL:-}" ]; then
  EMAIL_ARG=(-m "$CERTBOT_EMAIL")
else
  EMAIL_ARG=(--register-unsafely-without-email)
fi
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect "${EMAIL_ARG[@]}" \
  || warn "certbot failed. Check that $DOMAIN points to this server and ports 80/443 are open."

command -v ufw >/dev/null && ufw status | grep -q active && ufw allow 'Nginx Full' >/dev/null || true

# ---------------------------------------------------------------- done
log "Deployed"
echo "   Site:       $SITE_URL"
echo "   Installer:  $SITE_URL/install   (enter your Envato purchase code first)"
echo "   Ports:      API $API_PORT, Web $WEB_PORT  (saved in $PORTS_FILE)"
if [ "$FIRST_INSTALL" -eq 1 ]; then
  echo "   Admin:      $(get_env "$API_ENV" ADMIN_EMAIL) / $(get_env "$API_ENV" ADMIN_PASSWORD)"
  echo "               (also stored in $API_ENV; change it after first login)"
fi
echo "   Logs:       pm2 logs $API_NAME   |   pm2 logs $WEB_NAME"
