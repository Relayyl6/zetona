import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveTestimonial } from "@/lib/db/data-store";
import { TestimonialDTO } from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Spam honeypot trap
    if (body.website) {
      // Pretend success so bots don't retry
      return NextResponse.json({
        ok: true,
        message: "Thank you for sharing your experience! Your review will be featured once approved.",
      });
    }

    const author = body.author?.trim();
    const quote = body.quote?.trim();

    if (!author || !quote) {
      return NextResponse.json(
        { ok: false, error: "Please enter your name and review." },
        { status: 400 }
      );
    }

    const newReview: TestimonialDTO = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author,
      role: body.role?.trim() || "Client",
      location: body.location?.trim() || null,
      quote,
      email: body.email?.trim() || null,
      rating: typeof body.rating === "number" ? Math.min(Math.max(body.rating, 1), 5) : 5,
      sortOrder: 99,
      visible: false, // Must be approved by Zetona in Admin Dashboard
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await saveTestimonial(newReview);

    try {
      revalidatePath("/admin/settings");
    } catch {
      // ignore
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you for sharing your experience! Zetona will review and publish your review shortly.",
      reviewId: newReview.id,
    });
  } catch (err: any) {
    console.error("[Testimonials Submit] Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}
