import Link from "next/link";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/app/admin/CategoryForm";
import { ConfirmSubmit } from "@/app/admin/ConfirmSubmit";
import { createCategory, deleteCategory } from "@/app/admin/actions";

export default async function CategoriesAdmin() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      _count: { select: { products: true } },
      children: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          order: true,
          _count: { select: { products: true } },
        },
      },
    },
  });

  const parentOptions = categories.map((c) => ({ id: c.id, title: c.title }));

  const rows = categories.flatMap((category) => [
    {
      id: category.id,
      title: category.title,
      slug: category.slug,
      order: category.order,
      products: category._count.products,
      depth: 0,
    },
    ...category.children.map((child) => ({
      id: child.id,
      title: child.title,
      slug: child.slug,
      order: child.order,
      products: child._count.products,
      depth: 1,
    })),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Категории
        </h1>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Слаг</th>
                <th className="px-4 py-3 font-medium">Товаров</th>
                <th className="px-4 py-3 font-medium">Порядок</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-foreground">
                    <span style={row.depth ? { paddingLeft: "1.5rem" } : undefined}>
                      {row.depth ? "└ " : ""}
                      {row.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{row.slug}</td>
                  <td className="px-4 py-3 text-muted">{row.products}</td>
                  <td className="px-4 py-3 text-muted">{row.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/categories/${row.id}`}
                        className="text-accent-soft hover:text-accent"
                      >
                        Изменить
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={row.id} />
                        <ConfirmSubmit
                          message={`Удалить категорию «${row.title}»? Её товары будут удалены, а подкатегории станут категориями верхнего уровня.`}
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
      </div>

      <div className="rounded-2xl border border-border bg-surface/40 p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Добавить категорию
        </h2>
        <div className="mt-5">
          <CategoryForm action={createCategory} parents={parentOptions} />
        </div>
      </div>
    </div>
  );
}
