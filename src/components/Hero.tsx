import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import type { CategoryView } from "@/lib/categories";

const highlights = [
  "Доставка по Донецку",
  "Помощь в подборе оборудования",
  "Работаем с частными и юр. лицами",
];

export function Hero({ categories }: { categories: CategoryView[] }) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <Image
        src="/images/hero-bathroom.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--background) 0%, var(--background) 68%, transparent 96%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
        <div className="grid items-start gap-8 md:grid-cols-[320px_minmax(0,1fr)]">
          <CatalogSidebar categories={categories} />

          <div className="order-1 max-w-3xl md:order-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-soft">
              {siteConfig.legalName} · {siteConfig.city}
            </p>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {siteConfig.tagline}
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-muted">
              Смесители, сантехника, отопление и всё для ремонта ванной —
              от проверенных производителей, с консультацией по выбору
              и расчётом нужного количества.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/catalog"
                className="rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
              >
                Смотреть каталог
              </Link>
              <a
                href={siteConfig.phoneHref}
                className="rounded-full border border-border px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft"
              >
                {siteConfig.phone}
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
