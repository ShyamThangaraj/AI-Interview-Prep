import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // don't cache

function randomIntInclusive(min: number, max: number) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export async function POST(req: NextRequest) {
  const { min, max } = await req.json();

  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min > max
  ) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  return NextResponse.json({ value: randomIntInclusive(min, max) });
}
