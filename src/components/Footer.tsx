"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { TelegramIcon, InstagramIcon } from "@/components/icons";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-xl font-semibold tracking-[0.15em] text-foreground"
            >
              {siteConfig.name.toUpperCase()}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.tagline}. {siteConfig.city}.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={siteConfig.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-soft hover:text-accent-soft"
              >
                <TelegramIcon />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-soft hover:text-accent-soft"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
              Разделы
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
              <li>
                <Link href="/" className="transition-colors hover:text-accent-soft">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="transition-colors hover:text-accent-soft">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="transition-colors hover:text-accent-soft">
                  Связаться
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
              Контакты
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
              <li>{siteConfig.address}</li>
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="font-medium text-foreground transition-colors hover:text-accent-soft"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors hover:text-accent-soft"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>{siteConfig.workingHours}</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
              Реквизиты
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
              <li>{siteConfig.legalName}</li>
              <li>ИНН {siteConfig.inn}</li>
              <li>ОГРН {siteConfig.ogrn}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted">
          <span>
            © {year} {siteConfig.name}. Все права защищены.
          </span>
          <span>Цены на сайте не являются публичной офертой.</span>
        </div>
      </div>
    </footer>
  );
}
