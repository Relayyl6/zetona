import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllTestimonials, saveTestimonial, deleteTestimonial } from "@/lib/db/data-store";
import { TestimonialDTO } from "@/lib/db/queries";

export async function GET() {
  try {
    const testimonials = await getAllTestimonials({ includeAll: true });
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
      status: body.status || (body.visible !== false ? "approved" : "pending"),
      rating: typeof body.rating === "number" ? body.rating : 5,
      email: body.email?.trim() || null,
      createdAt: body.createdAt || new Date().toISOString(),
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "Testimonial ID is required" }, { status: 400 });
    }

    const all = await getAllTestimonials({ includeAll: true });
    const existing = all.find((t) => t.id === body.id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Testimonial not found" }, { status: 404 });
    }

    const updated: TestimonialDTO = {
      ...existing,
      ...body,
      status: body.status !== undefined ? body.status : (body.visible ? "approved" : existing.status),
      visible: body.visible !== undefined ? body.visible : (body.status === "approved" ? true : existing.visible),
    };

    const saved = await saveTestimonial(updated);

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
