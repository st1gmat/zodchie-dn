import { readUpload } from "@/lib/uploads";

// Serve uploaded product images from the storage dir (a Docker volume in prod).
// We can't rely on Next's public/ static serving for runtime uploads, so this
// route streams the file with a long immutable cache (filenames are uuids).
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[file]">) {
  const { file } = await ctx.params;
  const upload = await readUpload(file);
  if (!upload) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(upload.body), {
    headers: {
      "Content-Type": upload.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
