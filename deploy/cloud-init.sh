#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Автоматическая первоначальная настройка сервера для «Зодчие» (Timeweb cloud-init).
#
# Вставьте содержимое этого файла в поле «скрипт инициализации» при создании
# сервера (или в разделе «Конфигурация»). Запускается от root один раз при
# первой загрузке. Лог: /var/log/cloud-init-output.log
#
# ПЕРЕД ВСТАВКОЙ отредактируйте блок «НАСТРОЙКИ» ниже (как минимум — пароль).
# ─────────────────────────────────────────────────────────────────────────────
set -eu

# ============================ НАСТРОЙКИ ======================================
# Репозиторий с кодом (ветка main — чистая, готовая к деплою).
REPO_URL="https://github.com/st1gmat/zodchie-dn.git"
BRANCH="main"

# Пароль администратора сайта (вход в /admin/login). ЗАДАЙТЕ СВОЙ.
# Только латиница и цифры, без пробелов и кавычек. Скрипт сам посчитает хеш.
ADMIN_PASSWORD="changeme123"

# Заполнить сайт каталогом при первом запуске? yes / no
# Импортирует реальную номенклатуру из prisma/data/catalog.json (~5500 позиций,
# категории + бренды). ВНИМАНИЕ: сид делает чистый пересев — стирает всё, что
# уже есть в базе. Оставляйте "yes" только на ПЕРВОМ, чистом развёртывании.
SEED_DEMO="yes"

# Куда положить проект на сервере.
APP_DIR="/opt/zodchie"
# =============================================================================

export DEBIAN_FRONTEND=noninteractive
echo "=== [zodchie cloud-init] начало $(date) ==="

# 1. Базовые пакеты ----------------------------------------------------------
apt-get update -y
apt-get install -y git curl ca-certificates ufw openssl

# 2. Docker (+ плагин compose) ----------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# 3. Swap, если памяти меньше ~1.5 ГБ (защита от падения сборки по памяти) ----
mem_kb=$(awk '/MemTotal/{print $2}' /proc/meminfo)
if [ "$mem_kb" -lt 1500000 ] && [ ! -f /swapfile ]; then
  echo "=== [zodchie] мало RAM ($mem_kb kB) — создаю swap 2G ==="
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 4. Код проекта -------------------------------------------------------------
if [ ! -d "$APP_DIR/.git" ]; then
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# 5. Секреты (.env.production) ----------------------------------------------
SESSION_SECRET="$(openssl rand -base64 32)"

# Хеш пароля считаем во временном Node-контейнере (пароль передаём через -e PW,
# чтобы не возиться с экранированием). На выходе — сырой bcrypt-хеш ($2b$10$…).
ADMIN_PASSWORD_HASH_RAW="$(docker run --rm -e PW="$ADMIN_PASSWORD" node:20-alpine \
  sh -c 'npm i -s bcryptjs >/dev/null 2>&1 && node -e "console.log(require(\"bcryptjs\").hashSync(process.env.PW,10))"')"

# docker compose ПОДСТАВЛЯЕТ переменные в env_file, поэтому каждый $ в хеше
# нужно удвоить ($$), иначе "$2b$10$abc…" будет испорчен. Compose превратит
# $$ обратно в $ при чтении.
ADMIN_PASSWORD_HASH="$(printf '%s' "$ADMIN_PASSWORD_HASH_RAW" | sed 's/[$]/$$/g')"

cat > "$APP_DIR/.env.production" <<EOF
NODE_ENV=production
DATABASE_URL=postgresql://zodchie:zodchie@db:5432/zodchie
SESSION_SECRET=${SESSION_SECRET}
ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
SESSION_COOKIE_INSECURE=true
EOF
chmod 600 "$APP_DIR/.env.production"

# 6. Сборка и запуск ---------------------------------------------------------
docker compose -f docker-compose.prod.yml up -d --build

# 7. Каталог (после старта приложения, миграции уже применены entrypoint'ом).
#    Импорт реальной номенклатуры из catalog.json. Чистый пересев — только на
#    первом запуске (SEED_DEMO=yes).
if [ "$SEED_DEMO" = "yes" ]; then
  echo "=== [zodchie] жду готовности приложения для seed… ==="
  i=0
  while [ "$i" -lt 30 ]; do
    if curl -fsS http://localhost:3000/ >/dev/null 2>&1; then break; fi
    i=$((i + 1)); sleep 3
  done
  docker compose -f docker-compose.prod.yml exec -T app npx prisma db seed || \
    echo "=== [zodchie] seed не удался — можно запустить вручную позже ==="
fi

# 8. Фаервол -----------------------------------------------------------------
ufw allow OpenSSH || true
ufw allow 3000/tcp || true
ufw --force enable || true

# 9. Готово ------------------------------------------------------------------
IP="$(curl -fsS https://api.ipify.org 2>/dev/null || echo '<IP-сервера>')"
echo "=== [zodchie cloud-init] ГОТОВО $(date) ==="
echo "Сайт:   http://${IP}:3000"
echo "Админка: http://${IP}:3000/admin/login"
