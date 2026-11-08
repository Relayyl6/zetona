import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { uploadRequestSchema } from "@/lib/validators/photo";
import { buildDisplayKey, buildOriginalKey } from "@/lib/storage/keys";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce admin auth server-side
    await requireAdmin();

    const body = await req.json();
    const parsed = uploadRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 400 });
    }

    // Generate presigned specs
    const results = parsed.data.files.map((file, i) => {
      const photoId = `ph_${Date.now()}_${i}`;
      const hash8 = Math.random().toString(16).slice(2, 10);
      const displayKey = buildDisplayKey(photoId, hash8);
      const originalKey = buildOriginalKey(photoId, file.name);

      return {
        photoId,
        displayKey,
        originalKey,
        // In production with R2, this returns signed PUT URLs
        displayPutUrl: `https://${process.env.R2_BUCKET_PUBLIC || "zetona-public"}.r2.cloudflarestorage.com/${displayKey}`,
        originalPutUrl: `https://${process.env.R2_BUCKET_ORIGINALS || "zetona-originals"}.r2.cloudflarestorage.com/${originalKey}`,
      };
    });

    return NextResponse.json({ ok: true, uploads: results });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ ok: false, error: err.message }, { status });
  }
}
