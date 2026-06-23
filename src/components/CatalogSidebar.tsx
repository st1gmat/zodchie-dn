import Link from "next/link";
import type { CategoryView } from "@/lib/categories";

export function CatalogSidebar({ categories }: { categories: CategoryView[] }) {
  return (
    <aside className="hidden lg:block">
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="border-b border-border px-5 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
          Каталог
        </div>
        <nav>
          <ul className="py-2 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/catalog/${category.slug}`}
                  className="flex items-center justify-between gap-3 px-5 py-2.5 text-muted transition-colors hover:bg-surface-soft hover:text-accent-soft"
                >
                  {category.title}
                  <span aria-hidden className="text-border">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
