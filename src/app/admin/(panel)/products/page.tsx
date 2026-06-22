import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { ConfirmSubmit } from "@/app/admin/ConfirmSubmit";
import { deleteProduct } from "@/app/admin/actions";

export default async function ProductsAdmin() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      price: true,
      inStock: true,
      category: { select: { title: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Товары
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Добавить товар
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Наличие</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 text-foreground">{product.title}</td>
                <td className="px-4 py-3 text-muted">{product.category.title}</td>
                <td className="px-4 py-3 text-muted">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-muted">
                  {product.inStock ? "В наличии" : "Под заказ"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-accent-soft hover:text-accent"
                    >
                      Изменить
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <ConfirmSubmit
                        message={`Удалить товар «${product.title}»?`}
                        className="text-muted hover:text-red-600"
                      >
                        Удалить
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="mt-6 text-sm text-muted">Товаров пока нет.</p>
      )}
    </div>
  );
}
