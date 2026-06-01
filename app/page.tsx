"use client";

import { useState, useEffect } from "react";

const COLS = 22;
const ROWS = 6;
const GRID_COLS = 25;

export default function Home() {
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mapa, setMapa] = useState<{ [key: number]: string }>({});
  const [fotos, setFotos] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);

  // ✅ Carregar do localStorage
  useEffect(() => {
    const salvo = localStorage.getItem("mapa");
    if (salvo) setMapa(JSON.parse(salvo));
  }, []);

  useEffect(() => {
    localStorage.setItem("mapa", JSON.stringify(mapa));
  }, [mapa]);

  // ✅ Upload com loading
  async function carregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setCarregando(true);

    try {
      const uploads = Array.from(files).map(async (file) => {
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
        return data.secure_url;
      });

      const resultados = await Promise.all(uploads);
      const novas = resultados.filter(Boolean);

      setFotos((prev) => [...prev, ...novas]);
    } finally {
      setCarregando(false);
    }
  }

  function limparCadeiras() {
    setMapa({});
    setSelecionada(null);
  }

  // ✅ Lógica completa: adicionar + mover
  function clicarCadeira(num: number) {
    const novo = { ...mapa };

    // ✅ pegar da cadeira (modo mover)
    if (!selecionada && novo[num]) {
      setSelecionada(novo[num]);
      delete novo[num];
      setMapa(novo);
      return;
    }

    if (selecionada) {
      // remove de qualquer outra cadeira
      Object.keys(novo).forEach((key) => {
        if (novo[Number(key)] === selecionada) {
          delete novo[Number(key)];
        }
      });

      novo[num] = selecionada;
      setMapa(novo);

      // ✅ limpa seleção (evita mover sem querer)
      setSelecionada(null);
    }
  }

  const cadeiras = [];

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
          onContextMenu={(e) => {
            e.preventDefault();
            const novo = { ...mapa };
            delete novo[cadeiraNum];
            setMapa(novo);
          }}
          style={{
            width: "80%",
            aspectRatio: "1/1",
            background: "#2B2B2B",
            border: "1px solid #555",
            position: "relative",
            cursor: "pointer",
            margin: "0 auto",
            borderRadius: 6,
          }}
        >
          <span
            style={{
              position: "absolute",
              bottom: "102%",
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
        padding: "40px 20px 20px 20px",
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
          rowGap: 20,
          columnGap: 6,
        }}
      >
        {cadeiras}
      </div>

      {/* TÍTULOS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `
            repeat(5, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(5, 1fr)
          `,
          marginTop: 6,
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
          disabled={carregando}
          style={{
            background: "#007BFF",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
            cursor: carregando ? "not-allowed" : "pointer",
            opacity: carregando ? 0.6 : 1,
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

      {/* ✅ LOADING */}
      {carregando && (
        <div
          style={{
            marginTop: 15,
            padding: 15,
            background: "#222",
            borderRadius: 6,
            textAlign: "center",
            color: "#00FFAA",
            fontWeight: "bold",
          }}
        >
          ⏳ Carregando imagens... aguarde
        </div>
      )}

      {/* MINIATURAS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 15,
          padding: 10,
          background: "#111",
          borderRadius: 6,
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
