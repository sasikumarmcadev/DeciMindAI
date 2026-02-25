import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({ message: "Image analysis feature has been removed." }, { status: 200 });
}
