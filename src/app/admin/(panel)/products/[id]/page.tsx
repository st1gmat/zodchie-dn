import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/app/admin/ProductForm";
import { ProductImagesManager } from "@/app/admin/ProductImagesManager";
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
        images: {
          orderBy: { order: "asc" },
          select: { id: true, url: true },
        },
      },
    }),
    getCategoryOptions(),
  ]);

  if (!product) notFound();

  return (
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

      <div className="mt-10">
        <ProductImagesManager productId={product.id} images={product.images} />
      </div>
    </div>
  );
}
