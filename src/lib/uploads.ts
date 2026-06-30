import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Uploaded files live OUTSIDE public on purpose: `next start` only serves files
// that were in public/ at build time, so runtime uploads written into public/
// are NOT served in production. We store them in a separate dir (a Docker volume
// in prod) and serve them through the /uploads/[file] route handler instead.
// Resolved lazily (not at module scope) so the file tracer doesn't treat the
// process.cwd() path as a reason to trace the whole project.
function uploadDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "var", "uploads");
}
const MAX_BYTES = 8 * 1024 * 1024; // keep in sync with serverActions.bodySizeLimit

const EXTENSION_BY_TYPE = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export const CONTENT_TYPE_BY_EXTENSION = new Map([
  ["jpg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["avif", "image/avif"],
]);

/** Save an uploaded image and return its public URL (served by the route handler). */
export async function saveUpload(file: File): Promise<string> {
  const extension = EXTENSION_BY_TYPE.get(file.type);
  if (!extension) {
    throw new Error("Поддерживаются только JPEG, PNG, WebP и AVIF");
  }
  if (file.size === 0) throw new Error("Пустой файл");
  if (file.size > MAX_BYTES) throw new Error("Файл больше 8 МБ");

  await mkdir(uploadDir(), { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir(), filename), bytes);

  return `/uploads/${filename}`;
}

/** Remove a previously uploaded file. Only touches files under /uploads/. */
export async function deleteUpload(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  await unlink(path.join(uploadDir(), filename)).catch(() => {});
}

/** Read a stored upload by its filename. Returns null if missing or invalid. */
export async function readUpload(
  filename: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  // Guard against path traversal — only a bare filename is allowed.
  const safe = path.basename(filename);
  if (safe !== filename) return null;

  const extension = safe.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPE_BY_EXTENSION.get(extension);
  if (!contentType) return null;

  try {
    const body = await readFile(path.join(uploadDir(), safe));
    return { body, contentType };
  } catch {
    return null;
  }
}
