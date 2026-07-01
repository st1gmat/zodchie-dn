import Link from "next/link";

/** Build a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20. */
function pageWindow(current: number, count: number): (number | "gap")[] {
  const pages = new Set<number>([1, count, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= count)
    .sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({
  page,
  pageCount,
  hrefForPage,
}: {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const items = pageWindow(page, pageCount);

  const arrow =
    "flex h-10 min-w-10 items-center justify-center rounded-lg border border-border px-3 text-sm transition-colors hover:border-accent-soft hover:text-accent-soft";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1.5"
      aria-label="Постраничная навигация"
    >
      <Link
        href={hrefForPage(page - 1)}
        aria-label="Предыдущая страница"
        className={`${arrow} ${page <= 1 ? disabled : ""}`}
        aria-disabled={page <= 1}
      >
        ‹
      </Link>

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefForPage(item)}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm transition-colors ${
              item === page
                ? "border-accent-strong bg-accent-strong text-white"
                : "border-border hover:border-accent-soft hover:text-accent-soft"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={hrefForPage(page + 1)}
        aria-label="Следующая страница"
        className={`${arrow} ${page >= pageCount ? disabled : ""}`}
        aria-disabled={page >= pageCount}
      >
        ›
      </Link>
    </nav>
  );
}
