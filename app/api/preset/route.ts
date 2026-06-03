import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { preset } = await req.json();

    const ip = "192.168.100.88";

    // ⚠️ AJUSTE conforme SEU modelo VISCA/IP
    const url = `http://${ip}/visca/preset/${preset}`;

    await fetch(url, {
      method: "GET",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false });
  }
}
