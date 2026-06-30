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
      <p className="mt-2 max-w-xl text-sm text-muted">
        Сначала заполните основное и нажмите «Создать» — после этого откроется
        карточка товара, где можно добавить фотографии и характеристики.
      </p>
      <div className="mt-6">
        <ProductForm
          action={createProduct}
          categories={categories}
          submitLabel="Создать и продолжить"
        />
      </div>
    </div>
  );
}
