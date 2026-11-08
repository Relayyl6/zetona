import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPhotos, createPhoto } from "@/lib/db/data-store";

export async function GET(req: NextRequest) {
  try {
    const photos = await getAllPhotos();
    return NextResponse.json({ ok: true, photos });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const photo = await createPhoto(body);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/work");
      revalidatePath("/archive");
    } catch (e) {}
    return NextResponse.json({ ok: true, photo }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
