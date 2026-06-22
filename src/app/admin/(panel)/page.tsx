import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [categoryCount, productCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);

  const cards = [
    { href: "/admin/categories", label: "Категории", count: categoryCount },
    { href: "/admin/products", label: "Товары", count: productCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Обзор
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border bg-background p-6 transition-colors hover:border-accent-strong"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {card.count}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
