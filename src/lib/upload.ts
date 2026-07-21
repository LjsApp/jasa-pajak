import { supabase } from "@/integrations/supabase/client";

export type ImageBucket = "article-images" | "company-assets";

/** Slugify a filename while preserving the file extension. */
export function slugifyFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  const slug = base
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
  return ext ? `${slug}.${ext}` : slug;
}

function uniqueName(originalName: string): string {
  const slug = slugifyFilename(originalName);
  const dot = slug.lastIndexOf(".");
  const base = dot > 0 ? slug.slice(0, dot) : slug;
  const ext = dot > 0 ? slug.slice(dot) : "";
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}-${ts}-${rand}${ext}`;
}

export function getPublicUrl(bucket: ImageBucket, path: string | null | undefined): string {
  if (!path) return "";
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(
  bucket: ImageBucket,
  path: string | null | undefined,
): Promise<void> {
  if (!path) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch (e) {
    // swallow — don't block main flow on storage cleanup
    console.warn("[upload] deleteImage failed", path, e);
  }
}

export async function uploadImage(opts: {
  file: File;
  bucket: ImageBucket;
  folder: string;
  oldPath?: string | null;
}): Promise<{ path: string; publicUrl: string }> {
  const { file, bucket, folder, oldPath } = opts;
  const folderClean = folder.replace(/^\/+|\/+$/g, "");

  const tryUpload = async (): Promise<string> => {
    const path = `${folderClean}/${uniqueName(file.name)}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    return path;
  };

  let path: string;
  try {
    path = await tryUpload();
  } catch (e: any) {
    // Duplicate? Retry once with a fresh random suffix.
    if (e?.statusCode === "409" || e?.status === 409 || /exists|duplicate/i.test(e?.message ?? "")) {
      path = await tryUpload();
    } else {
      throw e;
    }
  }

  if (oldPath && oldPath !== path) {
    await deleteImage(bucket, oldPath);
  }

  return { path, publicUrl: getPublicUrl(bucket, path) };
}