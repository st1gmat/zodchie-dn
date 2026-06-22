import Image from "next/image";
import { ConfirmSubmit } from "@/app/admin/ConfirmSubmit";
import {
  addProductImages,
  deleteProductImage,
  makeProductImagePrimary,
} from "@/app/admin/actions";

export type ProductImageView = { id: string; url: string };

export function ProductImagesManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImageView[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="text-lg font-semibold text-foreground">Фотографии</h2>

      {images.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Фото пока нет — на сайте товар показывается с заглушкой.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-contain p-2"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-foreground">
                    Главная
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                {index === 0 ? (
                  <span className="text-muted">Главная</span>
                ) : (
                  <form action={makeProductImagePrimary}>
                    <input type="hidden" name="id" value={image.id} />
                    <button
                      type="submit"
                      className="text-accent-soft hover:text-accent"
                    >
                      Сделать главной
                    </button>
                  </form>
                )}

                <form action={deleteProductImage}>
                  <input type="hidden" name="id" value={image.id} />
                  <ConfirmSubmit
                    message="Удалить это фото?"
                    className="text-muted hover:text-red-600"
                  >
                    Удалить
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        action={addProductImages}
        className="mt-6 flex flex-wrap items-center gap-4"
      >
        <input type="hidden" name="productId" value={productId} />
        <input
          type="file"
          name="files"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          required
          className="text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-surface-soft file:px-4 file:py-2 file:text-sm file:text-foreground hover:file:bg-border"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Загрузить
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">
        JPEG, PNG, WebP или AVIF, до 8 МБ. Можно выбрать несколько файлов сразу.
      </p>
    </section>
  );
}
