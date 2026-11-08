import { NextRequest, NextResponse } from "next/server";
import { getAllEnquiries, toggleEnquiryHandled, deleteEnquiry } from "@/lib/db/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const enquiries = await getAllEnquiries();
    return NextResponse.json({ ok: true, enquiries });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }
    await toggleEnquiryHandled(body.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }
    await deleteEnquiry(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
