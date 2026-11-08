import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllTestimonials, saveTestimonial, deleteTestimonial } from "@/lib/db/data-store";
import { TestimonialDTO } from "@/lib/db/queries";

export async function GET() {
  try {
    const testimonials = await getAllTestimonials();
    return NextResponse.json({ ok: true, testimonials });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.author || !body.quote) {
      return NextResponse.json(
        { ok: false, error: "Author name and quote are required." },
        { status: 400 }
      );
    }

    const item: TestimonialDTO = {
      id: body.id || `test_${Date.now()}`,
      author: body.author.trim(),
      role: body.role?.trim() || null,
      location: body.location?.trim() || null,
      quote: body.quote.trim(),
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      visible: body.visible !== false,
    };

    const saved = await saveTestimonial(item);

    try {
      revalidatePath("/");
      revalidatePath("/admin/settings");
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true, testimonial: saved });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing testimonial ID" }, { status: 400 });
    }

    await deleteTestimonial(id);

    try {
      revalidatePath("/");
      revalidatePath("/admin/settings");
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
