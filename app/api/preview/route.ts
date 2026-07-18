import { NextResponse } from "next/server";
import { resolvePreviewUrl } from "@/services/previewService";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const previewUrl = await resolvePreviewUrl();
  return NextResponse.json({ previewUrl });
}

export async function POST(): Promise<Response> {
  const previewUrl = await resolvePreviewUrl();
  return NextResponse.json({ previewUrl });
}
