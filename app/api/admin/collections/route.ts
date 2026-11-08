import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { collectionSchema } from "@/lib/validators/collection";
import { getAllCollections, createCollection } from "@/lib/db/data-store";

export async function GET() {
  try {
    await requireAdmin();
    const collections = await getAllCollections();
    return NextResponse.json({ ok: true, collections });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = collectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 400 });
    }

    const created = await createCollection(parsed.data);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/work");
      revalidatePath("/admin/collections");
    } catch (e) {}

    return NextResponse.json({ ok: true, collection: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status || 500 });
  }
}
