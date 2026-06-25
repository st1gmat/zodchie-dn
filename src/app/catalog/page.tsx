import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Каталог — Зодчие",
  description: "Каталог сантехники и инженерного оборудования: смесители, унитазы, ванны, трубы, водонагреватели и другое.",
};

// Render on each request (reads the DB) — avoids needing a database at build time.
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
        Каталог
      </h1>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
            <h2 className="mt-5 text-base font-medium text-foreground">
              {category.title}
            </h2>
            {category.description && (
              <p className="mt-1 text-sm text-muted">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
