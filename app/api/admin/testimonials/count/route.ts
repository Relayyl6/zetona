import { NextResponse } from "next/server";
import { getAllTestimonials } from "@/lib/db/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await getAllTestimonials({ includeAll: true });
    const pendingCount = all.filter(
      (t) => t.status === "pending" || t.visible === false
    ).length;
    return NextResponse.json({ ok: true, pendingCount });
  } catch (err: any) {
    return NextResponse.json({ ok: false, pendingCount: 0, error: err.message }, { status: 500 });
  }
}
