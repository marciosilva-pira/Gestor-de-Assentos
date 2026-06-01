"use client";

import { useState } from "react";

const COLS = 22;
const ROWS = 6;
const GRID_COLS = 25;

export default function Home() {
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mapa, setMapa] = useState<{ [key: number]: string }>({});
  const [fotos, setFotos] = useState<string[]>([]);

  // ✅ UPLOAD (ACUMULA FOTOS)
  async function carregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    let novas: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "upload_cadeiras");
      formData.append("folder", "cadeiras");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dous0lse8/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        novas.push(data.secure_url);
      }
    }

    // ✅ ACUMULA corretamente
    setFotos((prev) => [...prev, ...novas]);
  }

  function limparCadeiras() {
    if (confirm("Deseja limpar todas as cadeiras?")) {
      setMapa({});
      setSelecionada(null);
    }
  }

  function clicarCadeira(num: number) {
    const novo = { ...mapa };

    if (selecionada) {
      novo[num] = selecionada;
      setSelecionada(null);
    } else if (novo[num]) {
      setSelecionada(novo[num]);
      delete novo[num];
    }

    setMapa(novo);
  }

  let cadeiras: any[] = [];

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      const corredores = [5, 12, 19];

      if (corredores.includes(j)) {
        cadeiras.push(<div key={`gap-${i}-${j}`} />);
        continue;
      }

      let col;
      if (j < 5) col = j;
      else if (j < 12) col = j - 1;
      else if (j < 19) col = j - 2;
      else col = j - 3;

      let linha = ROWS - 1 - i;
      let numeroLinha = linha * COLS + col + 1;
      let cadeiraNum = numeroLinha < 90 ? numeroLinha : numeroLinha + 10;

      const foto = mapa[cadeiraNum];

      cadeiras.push(
        <div
          key={i + "-" + j}
          onClick={() => clicarCadeira(cadeiraNum)}
          style={{
            width: "80%",
            aspectRatio: "1/1",
            background: "#2B2B2B",
            border: "1px solid #555",
            position: "relative",
            cursor: "pointer",
            margin: "0 auto",
          }}
        >
          {/* ✅ NUMERO COM ESPAÇO CORRETO */}
          <span
            style={{
              position: "absolute",
              bottom: "130%", // 👈 espaço maior
              width: "100%",
              textAlign: "center",
              color: "white",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            {cadeiraNum}
          </span>

          {foto && (
            <img
              src={foto}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </div>
      );
    }
  }

  return (
    <div
      style={{
        background: "#1E1E1E",
        minHeight: "100vh",
        padding: 20,
        color: "white",
      }}
    >
      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `
            repeat(5, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(5, 1fr)
          `,
          gap: 10,
        }}
      >
        {cadeiras}
      </div>

{/* TITULOS */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: `
      repeat(5, 1fr) 0.2fr
      repeat(6, 1fr) 0.2fr
      repeat(6, 1fr) 0.2fr
      repeat(5, 1fr)
    `,
    marginTop: 30,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#ccc",
  }}
>
  <div style={{ gridColumn: "1 / span 5", textAlign: "center" }}>
    3 - CADEIRA (ESQUERDO)
  </div>

  <div style={{ gridColumn: "7 / span 13", textAlign: "center" }}>
    2 - TRIBUNA
  </div>

  <div style={{ gridColumn: "20 / span 5", textAlign: "center" }}>
    4 - MESA (DIREITO)
  </div>
</div>


      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          id="uploadFotos"
          type="file"
          multiple
          onChange={carregarFotos}
          style={{ display: "none" }}
        />

        <button
          onClick={() =>
            document.getElementById("uploadFotos")?.click()
          }
          style={{
            background: "#007BFF",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Carregar Fotos
        </button>

        <button
          onClick={limparCadeiras}
          style={{
            background: "#dc3545",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Limpar Cadeiras
        </button>
      </div>

      {/* MINIATURAS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 20,
          padding: 10,
          background: "#111",
        }}
      >
        {fotos.map((src, index) => (
          <img
            key={index}
            src={src}
            onClick={() => setSelecionada(src)}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 6,
              cursor: "pointer",
              border:
                selecionada === src
                  ? "3px solid red"
                  : "1px solid #444",
            }}
          />
        ))}
      </div>
    </div>
  );
}
