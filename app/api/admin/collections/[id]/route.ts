import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { updateCollection, deleteCollection } from "@/lib/db/data-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateCollection(id, body);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Collection not found" }, { status: 404 });
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/work");
      revalidatePath("/admin/collections");
    } catch (e) {}

    return NextResponse.json({ ok: true, collection: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status || 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const success = await deleteCollection(id);
    if (!success) {
      return NextResponse.json({ ok: false, error: "Collection not found" }, { status: 404 });
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/work");
      revalidatePath("/admin/collections");
    } catch (e) {}

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status || 500 });
  }
}
