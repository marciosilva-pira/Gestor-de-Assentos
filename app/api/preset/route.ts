export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dgram from "dgram";

export async function POST(req: NextRequest) {
  console.log("📡 API /preset chamada (via UDP)");

  try {
    const { preset } = await req.json();
    console.log("🎯 Preset recebido do front:", preset);

    const CAMERA_IP = "192.168.100.88";
    const VISCA_PORT = 52381;

    // ⚠️ REGRA DO ZERO-INDEX:
    // Se a câmera não achar o preset ou for para uma cadeira errada (uma antes/depois),
    // mude esta linha para: const viscaPreset = preset - 1;
    const viscaPreset = preset;

    // 1. O comando VISCA puro (7 bytes)
    const payload = Buffer.from([
      0x81, 0x01, 0x04, 0x3F, 0x02, viscaPreset, 0xFF,
    ]);

    // 2. O Cabeçalho obrigatório para rede (VISCA over IP - 8 bytes)
    // [01 00] = Tipo da mensagem (Comando VISCA)
    // [00 07] = Tamanho do comando (7 bytes)
    // [00 00 00 01] = Número de sequência para a rede
    const header = Buffer.from([
      0x01, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x01
    ]);

    // 3. Junta o cabeçalho com o comando
    const command = Buffer.concat([header, payload]);

    console.log("📤 Pacote Completo (Hex):", command.toString("hex"));

    await new Promise<void>((resolve, reject) => {
      const client = dgram.createSocket("udp4");

      client.send(command, 0, command.length, VISCA_PORT, CAMERA_IP, (err) => {
        if (err) {
          console.error("❌ Erro ao enviar UDP:", err);
          client.close();
          reject(err);
        } else {
          console.log(`✅ Comando UDP disparado para preset ${viscaPreset}`);
          client.close();
          resolve();
        }
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}