# Деплой на VPS (Docker Compose)

Стек: Next.js (порт 3000) + PostgreSQL + загрузка фото на диск (Docker volume).
Всё поднимается одной командой через `docker-compose.prod.yml`.

## 1. Сервер

Любой VPS с Ubuntu 22.04+. Установить Docker и плагин compose:

```sh
curl -fsSL https://get.docker.com | sh
```

## 2. Код на сервер

```sh
git clone <repo-url> zodchie && cd zodchie
```

(или `scp` папку проекта — без `node_modules`/`.next`).

## 3. Секреты

```sh
cp .env.production.example .env.production
nano .env.production
```

Заполнить:
- `SESSION_SECRET` — длинная случайная строка: `openssl rand -base64 32`
- `ADMIN_PASSWORD_HASH` — хеш пароля админки. Сгенерировать (локально, где есть Node):
  `npx tsx prisma/hash-password.ts <пароль>` и вставить вывод (символы `$` оставить как есть).
- `SESSION_COOKIE_INSECURE=true` — оставить, пока сайт по HTTP без HTTPS (иначе вход в админку не сработает). Убрать после настройки HTTPS.

## 4. Запуск

```sh
docker compose -f docker-compose.prod.yml up -d --build
```

Поднимутся `db` и `app`; контейнер app применит миграции (`prisma migrate deploy`) и запустит сайт.

Заполнить демо-данными (по желанию, один раз):

```sh
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

Открыть: `http://<IP_сервера>:3000` — публичный сайт; `…/admin/login` — админка.
Открыть порт в фаерволе при необходимости: `ufw allow 3000`.

## 5. Обновление версии

```sh
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Данные и бэкапы

- Фото товаров — в volume `uploads`, база — в `pgdata`; переживают пересборку/рестарт.
- Бэкап БД: `docker compose -f docker-compose.prod.yml exec db pg_dump -U zodchie zodchie > backup.sql`
- Бэкап фото: `docker run --rm -v zodchie_uploads:/u -v "$PWD":/b alpine tar czf /b/uploads.tgz -C /u .`

## HTTPS (рекомендуется)

Для нормального домена и HTTPS поставьте перед app реверс-прокси **Caddy** (авто-сертификаты):
один сервис в compose, проксирующий `app:3000`, и `SESSION_COOKIE_INSECURE` можно убрать.
Скажите — добавлю Caddy в compose под ваш домен.

## Хранение картинок

Сейчас — локальный диск + Docker volume (просто, бесплатно, достаточно для одного сервера).
Если позже понадобится масштабирование/CDN/несколько серверов — переключим загрузку
(`src/lib/uploads.ts`) на S3-совместимое хранилище (Cloudflare R2 / Yandex Object Storage /
self-hosted MinIO). Менять нужно только запись файла и формирование URL.
