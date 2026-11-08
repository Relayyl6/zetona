import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { createPhoto } from "@/lib/db/data-store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Untitled Photo";
    const alt = (formData.get("alt") as string) || "Studio and portrait photography by Zetona_E";
    const caption = (formData.get("caption") as string) || "";
    const collectionId = (formData.get("collectionId") as string) || undefined;
    const featuredHome = formData.get("featuredHome") === "true";
    const featuredAbout = formData.get("featuredAbout") === "true";

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary under folder "zetona"
    const uploadResult = await uploadToCloudinary(buffer, file.name, {
      folder: "zetona",
    });

    const colMap: Record<string, { id: string; slug: string; title: string }> = {
      col_portraits_01: { id: "col_portraits_01", slug: "portraits", title: "Portraits" },
      col_studio_02: { id: "col_studio_02", slug: "studio", title: "Studio Sessions" },
      col_editorial_03: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
    };
    const resolvedCollection = collectionId && colMap[collectionId] ? colMap[collectionId] : null;

    // Save into persistent site data
    const newPhoto = await createPhoto({
      title,
      alt,
      caption,
      width: uploadResult.width,
      height: uploadResult.height,
      displayKey: uploadResult.secure_url,
      focal: { x: 0.5, y: 0.35 },
      featuredHome,
      featuredAbout,
      collectionId: resolvedCollection ? resolvedCollection.id : undefined,
      collection: resolvedCollection,
    });

    return NextResponse.json({ ok: true, photo: newPhoto });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}
