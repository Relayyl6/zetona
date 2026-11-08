import { NextResponse } from "next/server";
import { getAllEnquiries } from "@/lib/db/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const enquiries = await getAllEnquiries();
    const unhandled = enquiries.filter((e) => !e.handledAt).length;
    const total = enquiries.length;
    return NextResponse.json({ ok: true, unhandled, total });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, unhandled: 0, total: 0 }, { status: 500 });
  }
}
