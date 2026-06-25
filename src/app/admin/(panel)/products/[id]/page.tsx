import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/app/admin/ProductForm";
import { ProductImagesManager } from "@/app/admin/ProductImagesManager";
import { ProductAttributesEditor } from "@/app/admin/ProductAttributesEditor";
import { getCategoryOptions } from "@/lib/categories";
import { updateProduct } from "@/app/admin/actions";

export default async function EditProduct({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        inStock: true,
        order: true,
        categoryId: true,
        code: true,
        brand: true,
        article: true,
        images: { orderBy: { order: "asc" }, select: { id: true, url: true } },
        attributes: {
          orderBy: { order: "asc" },
          select: { name: true, value: true },
        },
        category: {
          select: {
            attributeTemplate: { orderBy: { order: "asc" }, select: { name: true } },
            parent: {
              select: {
                attributeTemplate: { orderBy: { order: "asc" }, select: { name: true } },
              },
            },
          },
        },
      },
    }),
    getCategoryOptions(),
  ]);

  if (!product) notFound();

  // Use the product's own category template, falling back to the parent's.
  const ownTemplate = product.category.attributeTemplate.map((a) => a.name);
  const template =
    ownTemplate.length > 0
      ? ownTemplate
      : (product.category.parent?.attributeTemplate ?? []).map((a) => a.name);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Товар: {product.title}
        </h1>
        <div className="mt-6">
          <ProductForm
            action={updateProduct}
            categories={categories}
            product={product}
          />
        </div>
      </div>

      <ProductAttributesEditor
        productId={product.id}
        initial={product.attributes}
        template={template}
      />

      <ProductImagesManager productId={product.id} images={product.images} />
    </div>
  );
}
