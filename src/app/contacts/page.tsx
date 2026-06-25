import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TelegramIcon, InstagramIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Контакты — Зодчие",
  description: `Контакты магазина сантехники «${siteConfig.name}» в ${siteConfig.city}: адрес, телефон, часы работы.`,
};

const rows = [
  { label: "Адрес", value: siteConfig.address },
  { label: "Телефон", value: siteConfig.phone, href: siteConfig.phoneHref },
  { label: "E-mail", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { label: "Часы работы", value: siteConfig.workingHours },
];

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
        Контакты
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Поможем подобрать сантехнику и оборудование, рассчитаем количество и
        расскажем о наличии и сроках поставки. Звоните или приходите.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <dl className="divide-y divide-border border-y border-border">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-wrap justify-between gap-2 py-4">
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="text-right font-medium text-foreground">
                  {row.href ? (
                    <a href={row.href} className="transition-colors hover:text-accent-soft">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={siteConfig.phoneHref}
              className="rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
            >
              Позвонить
            </a>
            <a
              href={siteConfig.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-soft hover:text-accent-soft"
            >
              <TelegramIcon className="h-5 w-5" />
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-soft hover:text-accent-soft"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-border bg-surface/60 p-8 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-soft"
          >
            <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
          <p className="mt-4 font-medium text-foreground">{siteConfig.address}</p>
          <p className="mt-1 text-sm text-muted">{siteConfig.city}</p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-6 text-sm text-muted">
        <span>{siteConfig.legalName}</span>
        <span>ИНН {siteConfig.inn}</span>
        <span>ОГРН {siteConfig.ogrn}</span>
      </div>
    </div>
  );
}
