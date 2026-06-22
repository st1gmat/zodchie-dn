import Image from "next/image";
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
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />

      <div className="relative flex gap-24 px-6 py-16 sm:py-20 lg:px-12">
        <CatalogSidebar categories={categories} />

        <div className="flex flex-1 items-center justify-center pr-32 lg:pr-56">
          <div className="w-full max-w-3xl py-8 sm:py-12">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-soft">
              {siteConfig.legalName} · {siteConfig.city}
            </p>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {siteConfig.tagline}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted">
              Смесители, сантехника, отопление и всё для ремонта ванной —
              от проверенных производителей, с консультацией по выбору
              и расчётом нужного количества.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
              >
                Смотреть каталог
              </a>
              <a
                href={siteConfig.phoneHref}
                className="rounded-full border border-border px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft"
              >
                {siteConfig.phone}
              </a>
            </div>

            <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
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