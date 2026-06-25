import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/app/admin/CategoryForm";
import { CategoryTemplateEditor } from "@/app/admin/CategoryTemplateEditor";
import { updateCategory } from "@/app/admin/actions";

export default async function EditCategory({
  params,
}: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  const [category, parents] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        order: true,
        parentId: true,
        attributeTemplate: { orderBy: { order: "asc" }, select: { name: true } },
      },
    }),
    // Only top-level categories can be parents, and a category can't parent itself.
    prisma.category.findMany({
      where: { parentId: null, id: { not: id } },
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!category) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Категория: {category.title}
        </h1>
        <div className="mt-6">
          <CategoryForm action={updateCategory} category={category} parents={parents} />
        </div>
      </div>

      <CategoryTemplateEditor
        categoryId={category.id}
        initial={category.attributeTemplate.map((a) => a.name)}
      />
    </div>
  );
}
