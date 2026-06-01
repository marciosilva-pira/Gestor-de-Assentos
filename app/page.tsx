"use client";

import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const COLS = 22;
const ROWS = 6;
const GRID_COLS = 25;

export default function Home() {
  const [carregado, setCarregado] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const [mapa, setMapa] = useState<{ [key: number]: string }>({});

  const [fotos, setFotos] = useState<string[]>([]);

  // ✅ impedir erro de hydration
  useEffect(() => {
    const salvo = localStorage.getItem("mapaCadeiras");
    if (salvo) {
      setMapa(JSON.parse(salvo));
    }
    setCarregado(true);
  }, []);

  // ✅ salvar apenas mapa
  useEffect(() => {
    if (carregado) {
      localStorage.setItem("mapaCadeiras", JSON.stringify(mapa));
    }
  }, [mapa, carregado]);

  // ✅ carregar fotos (base64, sem salvar)
  async function carregarFotos(e) {
  const files = e.target.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload_cadeiras"); // ✅ seu preset
    formData.append("folder", "cadeiras"); // opcional (organiza)

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dous0lse8/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    // ✅ salva URL da imagem online
    setFotos(data.secure_url ? [data.secure_url] : []);

  }
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

  if (!carregado) return null; // ✅ evita erro do Next

  let cadeiras: JSX.Element[] = [];

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

      let cadeiraNum;
      if (numeroLinha < 90) {
        cadeiraNum = numeroLinha;
      } else {
        cadeiraNum = numeroLinha + 10;
      }

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
          <span
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              marginBottom: -2,
              textAlign: "center",
              fontSize: 15,
              color: "white",
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
                background: "#2B2B2B",
                display: "block",
                margin: "auto",
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
        padding: "40px 10px 10px 10px",
        color: "white",
        fontFamily: "Arial",
        overflowX: "hidden",
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
          width: "100%",
          margin: "0 auto",
          rowGap: 19,
          columnGap: 1,
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
          marginTop: 20,
          marginBottom: 20,
          fontSize: 15,
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
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontWeight: "bold",
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
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontWeight: "bold",
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
          gap: 6,
          marginTop: 10,
        }}
      >
        {fotos.map((src, index) => (
          <img
            key={index}
            src={src}
            onClick={() => setSelecionada(src)}
            style={{
              width: 50,
              height: 50,
              objectFit: "contain",
              background: "#222",
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