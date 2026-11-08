import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { photoUpdateSchema, photoPublishGuard } from "@/lib/validators/photo";
import { savePhoto, deletePhoto, getPhotoById } from "@/lib/db/data-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photo = await getPhotoById(id);
    if (!photo) {
      return NextResponse.json({ ok: false, error: "Photo not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, photo });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = photoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 400 });
    }

    if (parsed.data.status === "published") {
      const altCheck = photoPublishGuard.safeParse({ alt: parsed.data.alt });
      if (!altCheck.success) {
        return NextResponse.json({ ok: false, error: altCheck.error.format() }, { status: 400 });
      }
    }

    const updatePayload: any = {
      ...parsed.data,
      alt: parsed.data.alt ?? undefined,
    };
    const updated = await savePhoto(id, updatePayload);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/work");
      revalidatePath("/archive");
    } catch (e) {}
    return NextResponse.json({ ok: true, id, updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePhoto(id);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/work");
      revalidatePath("/archive");
    } catch (e) {}
    return NextResponse.json({ ok: true, id, action: "deleted" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
