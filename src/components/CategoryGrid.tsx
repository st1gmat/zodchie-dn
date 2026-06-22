import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { CategoryView } from "@/lib/categories";

export function CategoryGrid({ categories }: { categories: CategoryView[] }) {
  return (
    <section id="catalog" className="border-b border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Каталог
          </h2>
          <p className="mt-4 text-muted">
            Выберите категорию, чтобы посмотреть товары. Уточнить наличие,
            цены и сроки поставки можно по телефону —{" "}
            <a
              href={siteConfig.phoneHref}
              className="font-medium text-accent-soft hover:text-accent"
            >
              {siteConfig.phone}
            </a>
            .
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog/${category.slug}`}
              className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-accent-strong"
            >
              <CategoryIcon
                id={category.icon ?? ""}
                className="h-8 w-8 text-accent-soft transition-colors group-hover:text-accent"
              />
              <h3 className="mt-5 text-base font-medium text-foreground">
                {category.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}