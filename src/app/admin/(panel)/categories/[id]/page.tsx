import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/app/admin/CategoryForm";
import { updateCategory } from "@/app/admin/actions";

export default async function EditCategory({
  params,
}: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      icon: true,
      order: true,
    },
  });

  if (!category) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Категория: {category.title}
      </h1>
      <div className="mt-6">
        <CategoryForm action={updateCategory} category={category} />
      </div>
    </div>
  );
}
