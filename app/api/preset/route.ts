import { NextRequest, NextResponse } from "next/server";
import net from "net";

export async function POST(req: NextRequest) {
  try {
    const { preset } = await req.json();

    const CAMERA_IP = "192.168.100.88";
    const VISCA_PORT = 52381; // ✅ conforme a tela da câmera

    // 🔹 VISCA: Recall Preset
    // 81 01 04 3F 02 pp FF
    const command = Buffer.from([
      0x81, // endereço da câmera (CAM 1)
      0x01,
      0x04,
      0x3F,
      0x02,
      preset, // número do preset (cadeira)
      0xFF,
    ]);

    await new Promise<void>((resolve, reject) => {
      const client = new net.Socket();

      client.connect(VISCA_PORT, CAMERA_IP, () => {
        client.write(command);
        client.end();
        resolve();
      });

      client.on("error", (err) => {
        reject(err);
      });
    });

    return NextResponse.json({
      ok: true,
      preset,
    });
  } catch (err) {
    console.error("❌ Erro VISCA:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}