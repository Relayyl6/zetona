import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteSettings, updateSiteSettings } from "@/lib/db/data-store";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSiteSettings(body);
    
    // Invalidate caches so updates immediately reflect across the live site
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/work");
      revalidatePath("/contact");
    } catch (e) {
      // ignore revalidation outside request context if any
    }

    return NextResponse.json({ ok: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PATCH(req);
}
