import Link from "next/link";
import type { CategoryView } from "@/lib/categories";

export function CatalogSidebar({ categories }: { categories: CategoryView[] }) {
  return (
    <aside className="relative z-30 hidden lg:block">
      <div className="rounded-2xl border border-border bg-background">
        <div className="border-b border-border px-5 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
          Каталог
        </div>
        <nav>
          <ul className="py-2 text-sm">
            {categories.map((category) => (
              <li key={category.id} className="group/cat relative">
                <Link
                  href={`/catalog/${category.slug}`}
                  className="flex items-center justify-between gap-3 px-5 py-2.5 text-muted transition-colors group-hover/cat:bg-surface-soft group-hover/cat:text-accent-soft"
                >
                  {category.title}
                  {category.children.length > 0 && (
                    <span aria-hidden className="text-border">
                      ›
                    </span>
                  )}
                </Link>

                {category.children.length > 0 && (
                  <div className="invisible absolute left-full top-0 z-40 pl-2 opacity-0 transition-all duration-200 group-hover/cat:visible group-hover/cat:opacity-100">
                    <div className="w-56 -translate-x-2 rounded-2xl border border-border bg-background p-2 shadow-lg transition-transform duration-200 group-hover/cat:translate-x-0">
                      <ul>
                        {category.children.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/catalog/${sub.slug}`}
                              className="block rounded-lg px-3 py-2 text-muted transition-colors hover:bg-surface-soft hover:text-accent-soft"
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
