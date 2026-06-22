import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024; // keep in sync with serverActions.bodySizeLimit

const EXTENSION_BY_TYPE = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

/** Save an uploaded image into public/uploads and return its public URL. */
export async function saveUpload(file: File): Promise<string> {
  const extension = EXTENSION_BY_TYPE.get(file.type);
  if (!extension) {
    throw new Error("Поддерживаются только JPEG, PNG, WebP и AVIF");
  }
  if (file.size === 0) throw new Error("Пустой файл");
  if (file.size > MAX_BYTES) throw new Error("Файл больше 8 МБ");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return `/uploads/${filename}`;
}

/** Remove a previously uploaded file. Only touches files under /uploads/. */
export async function deleteUpload(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
}
