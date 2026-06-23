import { ProductForm } from "@/app/admin/ProductForm";
import { getCategoryOptions } from "@/lib/categories";
import { createProduct } from "@/app/admin/actions";

export default async function NewProduct() {
  const categories = await getCategoryOptions();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Новый товар
      </h1>
      <div className="mt-6">
        <ProductForm action={createProduct} categories={categories} />
      </div>
    </div>
  );
}
