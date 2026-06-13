// ✅ TEM QUE SER A PRIMEIRA LINHA
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import net from "net";

export async function POST(req: NextRequest) {
  console.log("📡 API /preset chamada");

  try {
    const { preset } = await req.json();
    console.log("🎯 Preset recebido:", preset);

    const CAMERA_IP = "192.168.100.88";
    const VISCA_PORT = 52381;

    const command = Buffer.from([
      0x81,
      0x01,
      0x04,
      0x3F,
      0x02,
      preset,
      0xFF,
    ]);

    console.log("📤 Comando:", command.toString("hex"));

    await new Promise<void>((resolve, reject) => {
      const client = new net.Socket();

      client.connect(VISCA_PORT, CAMERA_IP, () => {
        console.log("✅ Conectou na câmera");
        client.write(command);
        console.log("📨 Enviado!");
        client.end();
        resolve();
      });

      client.on("error", (err) => {
        console.error("❌ Erro:", err);
        reject(err);
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false });
  }
}
